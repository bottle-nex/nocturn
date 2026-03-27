'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClaimStore } from '@/store/claim/useClaimStore';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { GET_CLAIM_URL, CONFIRM_CLAIM_URL } from 'routes/api_routes';
import { getProgram, USDC_MINT } from '@/lib/solana/program';
import { buildClaimPrizeTx } from '@/lib/solana/transactions';
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    getAccount,
} from '@solana/spl-token';

function getRankLabel(rank: number): string {
    if (rank === 1) return '1st Place';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return `${rank}th Place`;
}

function getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#E84545';
}

export default function ClaimPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { pageStatus, claimData, error, setPageStatus, setClaimData, setError } = useClaimStore();
    const { publicKey, connected, select, wallets, connect, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    const fetchClaim = useCallback(async () => {
        if (!token) {
            setPageStatus('not_found');
            return;
        }

        try {
            const res = await axios.get(`${GET_CLAIM_URL}/${token}`);
            const data = res.data.data;
            setClaimData(data);

            if (data.status === 'CLAIMED') {
                setPageStatus('claimed');
            } else if (data.status === 'EXPIRED' || new Date(data.expiresAt) < new Date()) {
                setPageStatus('expired');
            } else {
                setPageStatus('pending');
            }
        } catch {
            setPageStatus('not_found');
        }
    }, [token, setClaimData, setPageStatus]);

    useEffect(() => {
        fetchClaim();
    }, [fetchClaim]);

    const handleClaim = async () => {
        if (!publicKey || !signTransaction || !anchorWallet || !token || !claimData) return;

        setPageStatus('claiming');

        try {
            const program = getProgram(connection, anchorWallet);

            // Ensure claimer has a USDC ATA, create if missing
            const claimerAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
            let needsAta = false;
            try {
                await getAccount(connection, claimerAta);
            } catch {
                needsAta = true;
            }

            const tx = await buildClaimPrizeTx(program, claimData.quizId, token, publicKey);

            if (needsAta) {
                const createAtaIx = createAssociatedTokenAccountInstruction(
                    publicKey,
                    claimerAta,
                    publicKey,
                    USDC_MINT,
                );
                tx.instructions.unshift(createAtaIx);
            }

            tx.feePayer = publicKey;
            tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            const signed = await signTransaction(tx);
            const txSignature = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(txSignature, 'confirmed');

            const res = await axios.post(`${CONFIRM_CLAIM_URL}/${token}/confirm`, {
                txSignature,
                claimerWallet: publicKey.toBase58(),
            });

            if (res.data.success) {
                setPageStatus('claimed');
                setClaimData({ ...claimData, status: 'CLAIMED', txSignature });
            }
        } catch {
            setError('Failed to claim prize');
            setPageStatus('error');
        }
    };

    if (pageStatus === 'loading') {
        return (
            <div className="min-h-screen bg-[#2B2E4A] flex items-center justify-center">
                <div className="animate-pulse text-[#F3ECE7] text-lg">Loading claim...</div>
            </div>
        );
    }

    if (pageStatus === 'not_found') {
        return (
            <div className="min-h-screen bg-[#2B2E4A] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-[#F3ECE7]">Claim Not Found</h1>
                    <p className="text-[#F3ECE7]/60">
                        This claim link is invalid or has been removed.
                    </p>
                </div>
            </div>
        );
    }

    if (!claimData) return null;

    const timeLeft = Math.max(0, new Date(claimData.expiresAt).getTime() - Date.now());
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <div className="min-h-screen bg-[#2B2E4A] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#53354A] rounded-2xl p-8 shadow-2xl border border-[#903749]/30">
                {/* Rank Badge */}
                <div className="flex justify-center mb-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4"
                        style={{
                            borderColor: getRankColor(claimData.rank),
                            color: getRankColor(claimData.rank),
                            backgroundColor: `${getRankColor(claimData.rank)}15`,
                        }}
                    >
                        #{claimData.rank}
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold text-[#F3ECE7] text-center mb-1">
                    {pageStatus === 'claimed' ? 'Prize Claimed!' : 'Claim Your Prize'}
                </h1>
                <p className="text-[#F3ECE7]/60 text-sm text-center mb-6">
                    {getRankLabel(claimData.rank)} in &ldquo;{claimData.quizTitle}&rdquo;
                </p>

                {/* Prize Amount */}
                <div className="bg-[#2B2E4A] rounded-xl p-4 mb-6 text-center">
                    <p className="text-xs text-[#F3ECE7]/40 uppercase tracking-wider mb-1">
                        Prize Amount
                    </p>
                    <p className="text-3xl font-bold text-[#E84545]">
                        {claimData.amount.toFixed(2)} <span className="text-lg">USDC</span>
                    </p>
                </div>

                {/* Status-based content */}
                {pageStatus === 'expired' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 font-medium">This claim has expired</p>
                        <p className="text-red-400/60 text-xs mt-1">
                            The 7-day claim window has passed. The prize has been returned to the
                            host.
                        </p>
                    </div>
                )}

                {pageStatus === 'claimed' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center space-y-2">
                        <p className="text-green-400 font-medium">Successfully Claimed</p>
                        {claimData.claimerWallet && (
                            <p className="text-green-400/60 text-xs font-mono break-all">
                                Wallet: {claimData.claimerWallet}
                            </p>
                        )}
                        {claimData.txSignature &&
                            claimData.txSignature !== 'pending_onchain_implementation' && (
                                <a
                                    href={`https://explorer.solana.com/tx/${claimData.txSignature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#E84545] text-xs underline"
                                >
                                    View Transaction
                                </a>
                            )}
                    </div>
                )}

                {(pageStatus === 'pending' ||
                    pageStatus === 'connecting' ||
                    pageStatus === 'claiming') && (
                    <div className="space-y-4">
                        {/* Expiry notice */}
                        <p className="text-xs text-[#F3ECE7]/40 text-center">
                            Expires in {daysLeft}d {hoursLeft}h
                        </p>

                        {!connected ? (
                            <div className="space-y-3">
                                <p className="text-sm text-[#F3ECE7]/60 text-center">
                                    Connect your Solana wallet to claim
                                </p>
                                <div className="space-y-2">
                                    {wallets
                                        .filter((w) => w.readyState === 'Installed')
                                        .map((wallet) => (
                                            <button
                                                key={wallet.adapter.name}
                                                onClick={() => {
                                                    select(wallet.adapter.name);
                                                    connect().catch(console.error);
                                                }}
                                                className="w-full flex items-center gap-3 bg-[#2B2E4A] hover:bg-[#2B2E4A]/80 rounded-xl p-3 transition-colors"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={wallet.adapter.icon}
                                                    alt={wallet.adapter.name}
                                                    className="w-6 h-6"
                                                />
                                                <span className="text-sm text-[#F3ECE7]">
                                                    {wallet.adapter.name}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                                {wallets.filter((w) => w.readyState === 'Installed').length ===
                                    0 && (
                                    <p className="text-xs text-[#F3ECE7]/40 text-center">
                                        No wallet detected. Please install Phantom, Solflare, or
                                        Backpack.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-[#2B2E4A] rounded-xl p-3">
                                    <p className="text-xs text-[#F3ECE7]/40 mb-1">
                                        Connected Wallet
                                    </p>
                                    <p className="text-sm text-[#F3ECE7] font-mono break-all">
                                        {publicKey?.toBase58()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClaim}
                                    disabled={pageStatus === 'claiming'}
                                    className="w-full bg-[#E84545] hover:bg-[#E84545]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    {pageStatus === 'claiming' ? 'Claiming...' : 'Claim Prize'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {pageStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center space-y-2">
                        <p className="text-red-400 font-medium">Claim Failed</p>
                        <p className="text-red-400/60 text-xs">{error}</p>
                        <button
                            onClick={() => setPageStatus('pending')}
                            className="text-[#E84545] text-xs underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Participant info */}
                <div className="mt-6 pt-4 border-t border-[#903749]/30 text-center">
                    <p className="text-xs text-[#F3ECE7]/40">
                        Winner:{' '}
                        <span className="text-[#F3ECE7]/60">{claimData.participantName}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
