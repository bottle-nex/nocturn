'use client';

import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClaimStore } from '@/store/claim/useClaimStore';
import { useWallet, useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import SolanaAction from '@/lib/solana/SolanaAction';
import { ExternalLink, Check, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Helper for Vercel-style labels
function getRankLabel(rank: number): string {
    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner Up';
    if (rank === 3) return 'Third Place';
    return `Rank #${rank}`;
}

export default function ClaimPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    // Global Store
    const { pageStatus, claimData, error, setPageStatus, setClaimData, setError } = useClaimStore();

    // Solana Hooks
    const { publicKey, connected, select, wallets, connect, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    // Data Fetching Logic
    const fetchClaim = useCallback(async () => {
        if (!token) {
            setPageStatus('not_found');
            return;
        }

        try {
            const data = await SolanaAction.fetchClaimDetails(token);
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

    // Claim Transaction Logic
    const handleClaim = async () => {
        if (!publicKey || !signTransaction || !anchorWallet || !token || !claimData) return;

        setPageStatus('claiming');

        try {
            const program = SolanaAction.getProgram(connection, anchorWallet);
            const { createInstruction } = await SolanaAction.ensureUsdcAta(connection, publicKey);

            const tx = await SolanaAction.buildClaimPrizeTx(
                program,
                claimData.quizId,
                token,
                publicKey,
            );

            if (createInstruction) {
                tx.instructions.unshift(createInstruction);
            }

            const txSignature = await SolanaAction.signSendAndConfirm(
                connection,
                tx,
                publicKey,
                signTransaction,
            );

            const res = await SolanaAction.confirmClaim(token, txSignature, publicKey.toBase58());

            if (res.success) {
                setPageStatus('claimed');
                setClaimData({
                    ...claimData,
                    status: 'CLAIMED',
                    txSignature,
                    claimerWallet: publicKey.toBase58(),
                });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to claim prize. Please check your balance or connection.');
            setPageStatus('error');
        }
    };

    // Loading State
    if (pageStatus === 'loading') {
        return (
            <div className="min-h-screen bg-dark-alpha flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#4f46e5] animate-spin mb-4" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                    Authenticating Claim
                </p>
            </div>
        );
    }

    // Not Found State
    if (pageStatus === 'not_found' || !claimData) {
        return (
            <div className="min-h-screen bg-dark-alpha flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto opacity-50" />
                    <h1 className="text-xl font-medium text-white">Claim Not Found</h1>
                    <p className="text-sm text-white/40 leading-relaxed">
                        This claim link is invalid, expired, or has been removed from the Nocturn
                        protocol.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-alpha text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-[#4f46e5]/30">
            <div className="w-full max-w-110 relative">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#4f46e5]/20 blur-[100px] pointer-events-none" />

                <div className="bg-[#0a0a0a] border border-white/8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden rounded-xl">
                    {/* progress bar */}
                    {/* <div className="h-px w-full bg-white/5 relative">
                        <div 
                            className="absolute inset-y-0 left-0 bg-[#4f46e5] transition-all duration-1000" 
                            style={{ width: pageStatus === 'claimed' ? '100%' : pageStatus === 'claiming' ? '70%' : '30%' }}
                        />
                    </div> */}

                    <div className="p-8 ">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-2">
                                    {claimData.quizTitle}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-medium tracking-tight">
                                        {pageStatus === 'claimed'
                                            ? 'Assets Secured'
                                            : 'Claim Assets'}
                                    </span>
                                    {pageStatus === 'claimed' && (
                                        <Check size={18} className="text-[#4f46e5]" />
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-white/30 uppercase tracking-tighter mb-1">
                                    Rank
                                </div>
                                <div className="text-sm font-mono text-[#4f46e5]">
                                    00{claimData.rank}
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-medium tracking-tighter text-white">
                                    {claimData.amount.toFixed(2)}
                                </span>
                                <span className="text-lg font-light text-white/40">USDC</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-white/20 uppercase tracking-widest">
                                <ShieldCheck size={12} />
                                Verified {getRankLabel(claimData.rank)} Reward
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* pending state */}
                            {pageStatus === 'pending' && (
                                <>
                                    {!connected ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 gap-2">
                                                {wallets
                                                    .filter((w) => w.readyState === 'Installed')
                                                    .map((wallet) => (
                                                        <button
                                                            key={wallet.adapter.name}
                                                            onClick={() => {
                                                                select(wallet.adapter.name);
                                                                connect().catch(console.error);
                                                            }}
                                                            className="w-full h-12 bg-white text-black text-sm font-semibold flex items-center justify-center gap-3 hover:bg-white/90 transition-all rounded-sm"
                                                        >
                                                            <Image
                                                                src={wallet.adapter.icon}
                                                                alt={`${wallet.adapter.name} icon`}
                                                                width={20}
                                                                height={20}
                                                                className="w-5 h-5"
                                                            />
                                                            Connect {wallet.adapter.name}
                                                        </button>
                                                    ))}
                                                {wallets.filter((w) => w.readyState === 'Installed')
                                                    .length === 0 && (
                                                    <p className="text-center text-[10px] text-red-500/60 uppercase tracking-widest py-2">
                                                        No Solana Wallet Detected
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleClaim}
                                            disabled={pageStatus === 'pending'}
                                            className="w-full h-12 bg-[#4f46e5] text-white text-sm font-semibold flex items-center justify-center gap-2 group hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50"
                                        >
                                            {pageStatus === 'pending' ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <>
                                                    Execute Claim{' '}
                                                    <ArrowRight
                                                        size={16}
                                                        className="group-hover:translate-x-1 transition-transform"
                                                    />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            )}

                            {/* claimed state */}
                            {pageStatus === 'claimed' && (
                                <div className="p-4 bg-white/2 border border-white/8 rounded-md">
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className="text-white/40">Transaction</span>
                                        {claimData.txSignature && (
                                            <a
                                                href={`https://explorer.solana.com/tx/${claimData.txSignature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#4f46e5] flex items-center gap-1 hover:underline text-xs"
                                            >
                                                {claimData.txSignature.slice(0, 4)}...
                                                {claimData.txSignature.slice(-4)}{' '}
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/40">Recipient</span>
                                        <span className="text-white font-mono text-xs">
                                            {claimData.claimerWallet?.slice(0, 6)}...
                                            {claimData.claimerWallet?.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ERROR STATE */}
                            {pageStatus === 'error' && (
                                <div className="p-4 border border-red-500/20 bg-red-500/5 flex items-start gap-3 rounded-md">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-red-500 font-medium">
                                            Transaction Failed
                                        </p>
                                        <p className="text-[11px] text-red-500/50 leading-relaxed mt-1">
                                            {error || 'The blockchain returned an execution error.'}
                                        </p>
                                        <button
                                            onClick={() => setPageStatus('pending')}
                                            className="mt-2 text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                        >
                                            Retry Execution
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* expoered state */}
                            {pageStatus === 'expired' && (
                                <div className="p-4 border border-white/10 bg-white/2 text-center rounded-md">
                                    <p className="text-sm text-white/40 italic font-light">
                                        This claim session has expired. Assets were returned to
                                        treasury.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* footer */}
                        <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse" />
                                <span className="text-[10px] uppercase tracking-widest text-white/30">
                                    Devnet Protocol
                                </span>
                            </div>
                            <span className="text-[10px] text-white/20 font-mono italic">
                                Winner: {claimData.participantName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}