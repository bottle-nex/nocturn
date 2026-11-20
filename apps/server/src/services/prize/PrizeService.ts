import crypto from 'crypto';
import { prisma } from '@nocturn/database';
import { allocatePrizes, type RankedParticipant } from './prize-allocation';

export default class PrizeService {
    static async prepare_claims(
        quizId: string,
        gameSessionId: string,
        participants: RankedParticipant[],
    ) {
        return prisma.$transaction(async (tx) => {
            // Serialize preparation with distribution changes and other results requests.
            await tx.$queryRaw`SELECT id FROM quizzes WHERE id = ${quizId} FOR UPDATE`;
            const quiz = await tx.quiz.findUnique({
                where: { id: quizId },
                include: { prizeDistributions: true, prizeClaims: true },
            });
            if (!quiz) throw new Error('Quiz not found');
            if (quiz.payoutPreparedAt) return quiz.prizeClaims;
            if (quiz.prizeClaims.length)
                throw new Error('Existing prizes require on-chain reconciliation');
            if (quiz.status !== 'LIVE') throw new Error('Quiz is not live');
            if (quiz.fundedBaseUnits === null)
                throw new Error('Prize funding must be verified before results');
            const allocation = allocatePrizes(
                BigInt(quiz.fundedBaseUnits),
                quiz.prizeDistributions,
                participants,
            );
            if (allocation.claims.length > 255)
                throw new Error('Too many winners for the on-chain counter');
            for (const entry of allocation.ranks) {
                const participant = await tx.participant.findFirst({
                    where: { id: entry.participantId, quizId },
                });
                if (!participant)
                    throw new Error('Leaderboard participant does not belong to this quiz');
                await tx.participant.update({
                    where: { id: entry.participantId },
                    data: { finalRank: entry.rank },
                });
            }
            for (const entry of allocation.claims) {
                const participant = await tx.participant.findUniqueOrThrow({
                    where: { id: entry.participantId },
                });
                const claimToken = crypto.randomBytes(16).toString('hex');
                await tx.prizeClaim.create({
                    data: {
                        quizId,
                        participantId: entry.participantId,
                        rank: entry.rank,
                        amount: Number(entry.amountBaseUnits) / 1e6,
                        amountBaseUnits: entry.amountBaseUnits,
                        claimToken,
                        claimTokenHash: crypto
                            .createHash('sha256')
                            .update(claimToken)
                            .digest('hex'),
                        emailHash: crypto
                            .createHash('sha256')
                            .update(participant.email)
                            .digest('hex'),
                        expiresAt: null,
                    },
                });
            }
            await tx.quiz.update({
                where: { id: quizId },
                data: { payoutPreparedAt: new Date(), status: 'PAYOUT_PENDING' },
            });
            await tx.gameSession.update({
                where: { id: gameSessionId, quizId },
                data: {
                    status: 'COMPLETED',
                    hostScreen: 'QUIZ_RESULTS',
                    participantScreen: 'QUIZ_RESULTS',
                    spectatorScreen: 'QUIZ_RESULTS',
                    currentPhase: 'QUIZ_RESULTS',
                    quizEndScreen: 'ARE_YOU_UP',
                },
            });
            return tx.prizeClaim.findMany({ where: { quizId }, orderBy: { rank: 'asc' } });
        });
    }
}
