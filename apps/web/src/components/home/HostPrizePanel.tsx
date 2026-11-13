'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SolanaAction, { type HostEscrow, type PendingRefund } from '@/lib/solana/SolanaAction';

function refundError(error: unknown): string {
    if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        return error.response.data.message;
    }
    return error instanceof Error ? error.message : 'Unable to process refund';
}

function EscrowCard({
    escrow,
    token,
    refresh,
}: {
    escrow: HostEscrow;
    token: string;
    refresh: () => Promise<void>;
}) {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [pending, setPending] = useState<PendingRefund | null>(null);
    const storageKey = `nocturn-refund:${escrow.id}`;
    const correctWallet = publicKey?.toBase58() === escrow.hostWalletPubkey;

    useEffect(() => {
        try {
            const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
            if (
                stored &&
                typeof stored === 'object' &&
                'action' in stored &&
                (stored.action === 'cancel' || stored.action === 'reclaim') &&
                'hostTokenAccount' in stored &&
                typeof stored.hostTokenAccount === 'string' &&
                'blockhash' in stored &&
                typeof stored.blockhash === 'string' &&
                'txSignature' in stored &&
                typeof stored.txSignature === 'string'
            ) {
                const claimId =
                    'claimId' in stored && typeof stored.claimId === 'string'
                        ? stored.claimId
                        : undefined;
                setPending({
                    blockhash: stored.blockhash,
                    action: stored.action,
                    hostTokenAccount: stored.hostTokenAccount,
                    txSignature: stored.txSignature,
                    claimId,
                });
            }
        } catch {
            setMessage('Unable to read the saved refund confirmation.');
        }
    }, [storageKey]);

    async function confirm(refund: PendingRefund) {
        const {
            value: [status],
        } = await connection.getSignatureStatuses([refund.txSignature], {
            searchTransactionHistory: true,
        });
        if (
            status?.err ||
            (!status && !(await connection.isBlockhashValid(refund.blockhash)).value)
        ) {
            localStorage.removeItem(storageKey);
            setPending(null);
            throw new Error('The refund transaction failed or expired. You can submit it again.');
        }
        await SolanaAction.confirmRefund(token, escrow.id, refund);
        localStorage.removeItem(storageKey);
        setPending(null);
        setMessage('Refund confirmed. USDC has been returned to your staking wallet.');
        await refresh();
    }

    async function refund(action: 'cancel' | 'reclaim', claimId?: string) {
        if (!publicKey || !signTransaction || !correctWallet) return;
        setBusy(true);
        setMessage('Approve the refund in your wallet.');
        try {
            const { ata, createInstruction } = await SolanaAction.ensureUsdcAta(
                connection,
                publicKey,
            );
            const transaction = await SolanaAction.buildRefund(
                token,
                escrow.id,
                action,
                ata.toBase58(),
                claimId,
            );
            const blockhash = transaction.recentBlockhash;
            if (!blockhash) throw new Error('Refund transaction is missing its blockhash');
            if (createInstruction) transaction.instructions.unshift(createInstruction);
            const signed = await signTransaction(transaction);
            const txSignature = await connection.sendRawTransaction(signed.serialize());
            const saved: PendingRefund = {
                blockhash,
                action,
                claimId,
                hostTokenAccount: ata.toBase58(),
                txSignature,
            };
            setPending(saved);
            localStorage.setItem(storageKey, JSON.stringify(saved));
            setMessage('Confirming refund on-chain…');
            // The server verifies the exact instruction and successful execution.
            // Keep the signature if confirmation is not available yet.
            await connection.confirmTransaction(txSignature, 'confirmed');
            await confirm(saved);
        } catch (error) {
            setMessage(refundError(error));
        } finally {
            setBusy(false);
        }
    }

    async function retryConfirmation() {
        if (!pending) return;
        setBusy(true);
        try {
            await confirm(pending);
        } catch (error) {
            setMessage(refundError(error));
        } finally {
            setBusy(false);
        }
    }

    return (
        <article className="rounded-lg border border-dark-base/10 dark:border-light-base/10 p-4 space-y-3">
            <h3 className="font-medium">{escrow.title}</h3>
            <p className="text-sm">
                {escrow.status === 'TIMED_OUT' ? 'Quiz timed out. ' : ''}
                {escrow.error ||
                    (escrow.cancelled
                        ? 'Escrow cancelled — funds returned.'
                        : `${escrow.finalized ? 'Finalized' : 'Staked'} · ${Number(escrow.balanceBaseUnits || 0) / 1e6} USDC in escrow`)}
            </p>
            {!escrow.error && !escrow.cancelled && (
                <>
                    <p className="text-xs break-all">Staking wallet: {escrow.hostWalletPubkey}</p>
                    {!correctWallet && (
                        <p className="text-sm">Connect this wallet to request a refund.</p>
                    )}
                    {escrow.canCancel && (
                        <Button
                            disabled={busy || !!pending || !correctWallet || !signTransaction}
                            onClick={() => refund('cancel')}
                        >
                            {escrow.status === 'TIMED_OUT'
                                ? 'Cancel and refund timed-out quiz'
                                : 'Cancel and refund quiz'}
                        </Button>
                    )}
                    {!escrow.canCancel && !escrow.finalized && (
                        <p className="text-sm">
                            Cancellation is available before launch or after the quiz times out.
                        </p>
                    )}
                    {escrow.claims?.length === 0 && <p className="text-sm">No prize claims.</p>}
                    {escrow.claims?.map((claim) => (
                        <div key={claim.id} className="flex flex-wrap items-center gap-3 text-sm">
                            <span>
                                Rank {claim.rank}: {Number(claim.amountBaseUnits) / 1e6} USDC ·{' '}
                                {claim.status}
                            </span>
                            {claim.expiresAt && (
                                <span>Expires {new Date(claim.expiresAt).toLocaleString()}</span>
                            )}
                            {claim.canReclaim && (
                                <Button
                                    disabled={
                                        busy || !!pending || !correctWallet || !signTransaction
                                    }
                                    onClick={() => refund('reclaim', claim.id)}
                                >
                                    Reclaim
                                </Button>
                            )}
                        </div>
                    ))}
                </>
            )}
            {pending && (
                <div className="space-y-2 text-sm">
                    <p>A refund was submitted. Confirm it to update your dashboard.</p>
                    <p className="break-all">Transaction: {pending.txSignature}</p>
                    <Button disabled={busy} onClick={retryConfirmation}>
                        Confirm submitted refund
                    </Button>
                </div>
            )}
            {message && (
                <p role="status" className="text-sm">
                    {message}
                </p>
            )}
        </article>
    );
}

export default function HostPrizePanel() {
    const token = useUserSessionStore((s) => s.session?.user?.token);
    const [escrows, setEscrows] = useState<HostEscrow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const refresh = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            setEscrows(await SolanaAction.fetchEscrows(token));
        } catch (error) {
            setError(refundError(error));
        } finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        void refresh();
    }, [refresh]);

    if (!token) return null;

    return (
        <section className="space-y-4 text-dark-base dark:text-light-base">
            <div className="flex items-center justify-between">
                <h2 className="text-lg">Prizes</h2>
                <Button onClick={refresh} disabled={loading || !token}>
                    Refresh prizes
                </Button>
            </div>
            {loading && <p role="status">Loading escrows…</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && escrows.length === 0 && <p>No staked quizzes yet.</p>}
            {escrows.map((escrow) => (
                <EscrowCard key={escrow.id} escrow={escrow} token={token} refresh={refresh} />
            ))}
        </section>
    );
}
