import { Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import { solanaServiceInstance } from '../../services/init.services';

const cancellableStatuses: string[] = ['CREATED', 'SCHEDULED', 'PUBLISHED', 'TIMED_OUT'];

export async function getEscrowsController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { hostId: req.user.id, escrowPda: { not: null } },
            include: { prizeClaims: { orderBy: { rank: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
        const escrows = await Promise.all(
            quizzes.map(async (quiz) => {
                const base = {
                    id: quiz.id,
                    title: quiz.title,
                    status: quiz.status,
                    hostWalletPubkey: quiz.hostWalletPubkey,
                };
                try {
                    if (!quiz.hostWalletPubkey) throw new Error('Missing staking wallet');
                    const state = await solanaServiceInstance.get_escrow_state(
                        quiz.id,
                        quiz.hostWalletPubkey,
                    );
                    const claims = await Promise.all(
                        quiz.prizeClaims.map(async (claim) => {
                            const onChain = await solanaServiceInstance.get_refund_claim(
                                quiz.id,
                                claim.claimToken,
                            );
                            return {
                                id: claim.id,
                                rank: claim.rank,
                                amountBaseUnits: claim.amountBaseUnits.toString(),
                                status: claim.status,
                                expiresAt: onChain
                                    ? new Date(onChain.expiresAt).toISOString()
                                    : null,
                                canReclaim:
                                    state.finalized &&
                                    !state.cancelled &&
                                    !!onChain &&
                                    !onChain.claimed &&
                                    onChain.expiresAt <= Date.now(),
                            };
                        }),
                    );
                    return {
                        ...base,
                        ...state,
                        canCancel:
                            !state.cancelled &&
                            !state.finalized &&
                            cancellableStatuses.includes(quiz.status),
                        claims,
                        error: null,
                    };
                } catch (error) {
                    console.error('Failed to read escrow:', error);
                    return { ...base, error: 'Unable to load on-chain escrow state' };
                }
            }),
        );
        ResponseWriter.success(res, escrows);
    } catch (error) {
        console.error('Failed to get escrows:', error);
        ResponseWriter.system_error(res);
    }
}

export function refundController(action: 'cancel' | 'reclaim', confirm = false) {
    return async (req: Request, res: Response) => {
        if (!req.user?.id) {
            ResponseWriter.not_authorized(res);
            return;
        }
        const { quizId } = req.params;
        const { hostTokenAccount, claimId, txSignature } = req.body ?? {};
        if (
            !quizId ||
            typeof hostTokenAccount !== 'string' ||
            (action === 'reclaim' && typeof claimId !== 'string') ||
            (confirm && (typeof txSignature !== 'string' || !txSignature))
        ) {
            ResponseWriter.invalid_data(res, 'Refund transaction fields are required');
            return;
        }
        try {
            new PublicKey(hostTokenAccount);
        } catch {
            ResponseWriter.invalid_data(res, 'Invalid host token account');
            return;
        }
        try {
            const quiz = await prisma.quiz.findFirst({
                where: { id: quizId, hostId: req.user.id },
            });
            if (!quiz) {
                ResponseWriter.not_found(res, 'Quiz not found');
                return;
            }
            if (!quiz.escrowPda || !quiz.hostWalletPubkey) {
                ResponseWriter.invalid_data(res, 'Quiz has no staked escrow');
                return;
            }
            const claim =
                action === 'reclaim'
                    ? await prisma.prizeClaim.findFirst({ where: { id: claimId, quizId } })
                    : null;
            if (action === 'reclaim' && !claim) {
                ResponseWriter.not_found(res, 'Prize claim not found');
                return;
            }
            if (!confirm) {
                const state = await solanaServiceInstance.get_escrow_state(
                    quizId,
                    quiz.hostWalletPubkey,
                );
                const onChainClaim =
                    claim &&
                    (await solanaServiceInstance.get_refund_claim(quizId, claim.claimToken));
                const eligible =
                    action === 'cancel'
                        ? !state.cancelled &&
                          !state.finalized &&
                          cancellableStatuses.includes(quiz.status)
                        : !state.cancelled &&
                          state.finalized &&
                          !!onChainClaim &&
                          !onChainClaim.claimed &&
                          onChainClaim.expiresAt <= Date.now();
                if (!eligible) {
                    ResponseWriter.error(
                        res,
                        'REFUND_UNAVAILABLE',
                        'Escrow is not eligible for this refund',
                        undefined,
                        409,
                    );
                    return;
                }
            }
            const instruction = await solanaServiceInstance.refund_instruction(
                quizId,
                quiz.hostWalletPubkey,
                hostTokenAccount,
                claim?.claimToken,
            );
            if (!confirm) {
                const transaction = await solanaServiceInstance.build_refund_transaction(
                    instruction,
                    quiz.hostWalletPubkey,
                );
                ResponseWriter.success(res, { transaction });
                return;
            }
            const valid = await solanaServiceInstance.verify_refund_transaction(
                txSignature,
                instruction,
                quiz.hostWalletPubkey,
            );
            if (!valid) {
                ResponseWriter.error(
                    res,
                    'INVALID_TX',
                    'Refund transaction verification failed',
                    undefined,
                    400,
                );
                return;
            }
            await prisma.$transaction(async (tx) => {
                if (action === 'cancel') {
                    await tx.quiz.update({
                        where: { id: quizId },
                        data: { status: 'CANCELLED', endedAt: new Date() },
                    });
                }
                await tx.prizeClaim.updateMany({
                    where: {
                        quizId,
                        ...(claim ? { id: claim.id } : {}),
                        status: { in: ['PENDING', 'EXPIRED'] },
                    },
                    data: { status: 'REFUNDED', txSignature },
                });
            });
            ResponseWriter.success(res, { status: action === 'cancel' ? 'CANCELLED' : 'REFUNDED' });
        } catch (error) {
            console.error('Failed to process refund:', error);
            ResponseWriter.system_error(res);
        }
    };
}
