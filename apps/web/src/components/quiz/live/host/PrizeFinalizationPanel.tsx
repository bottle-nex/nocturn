'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { GET_PRIZE_CLAIMS_URL, AUTHORIZE_CONFIRM_URL } from 'routes/api_routes';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { motion } from 'framer-motion';
import { getProgram } from '@/lib/solana/program';
import { buildAuthorizePlatformTx } from '@/lib/solana/transactions';

interface PrizeClaim {
    id: string;
    rank: number;
    amount: number;
    amountBaseUnits: string;
    status: string;
    participant: {
        nickname: string;
        avatar: string | null;
        email: string;
    };
}

type FinalizationStep = 'loading' | 'ready' | 'authorizing' | 'finalizing' | 'complete' | 'error';

function getRankLabel(rank: number): string {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
}

function getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (rank === 2) return 'bg-neutral-400/20 text-neutral-300 border-neutral-400/30';
    if (rank === 3) return 'bg-amber-600/20 text-amber-500 border-amber-600/30';
    return 'bg-neutral-600/20 text-neutral-400 border-neutral-600/30';
}

export default function PrizeFinalizationPanel({ quizId }: { quizId: string }) {
    const [claims, setClaims] = useState<PrizeClaim[]>([]);
    const [step, setStep] = useState<FinalizationStep>('loading');
    const [error, setError] = useState<string | null>(null);
    const { publicKey, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const { quiz } = useLiveQuizStore();

    const fetchClaims = useCallback(async () => {
        try {
            const res = await axios.get(`${GET_PRIZE_CLAIMS_URL}/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setClaims(res.data.data);
            setStep('ready');
        } catch {
            setError('Failed to fetch prize claims');
            setStep('error');
        }
    }, [quizId]);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    const handleAuthorize = async () => {
        if (!publicKey || !signTransaction || !anchorWallet) {
            setError('Please connect your wallet first');
            return;
        }

        setStep('authorizing');

        try {
            const platformPubkey = new PublicKey(
                process.env.NEXT_PUBLIC_PLATFORM_AUTHORITY_PUBKEY!,
            );
            const program = getProgram(connection, anchorWallet);

            const tx = await buildAuthorizePlatformTx(program, quizId, platformPubkey, publicKey);
            tx.feePayer = publicKey;
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            const signed = await signTransaction(tx);
            const txSignature = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(
                { signature: txSignature, blockhash, lastValidBlockHeight },
                'confirmed',
            );

            setStep('finalizing');

            await axios.post(
                `${AUTHORIZE_CONFIRM_URL}/${quizId}`,
                { txSignature },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );

            setStep('complete');
        } catch {
            setError('Authorization failed');
            setStep('error');
        }
    };

    if (!quiz?.prizePool || quiz.prizePool <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 w-96 bg-[#53354A] rounded-xl border border-[#903749]/30 shadow-2xl overflow-hidden z-50"
        >
            <div className="p-4 border-b border-[#903749]/30">
                <h3 className="text-sm font-semibold text-[#F3ECE7]">Prize Distribution</h3>
                <p className="text-xs text-[#F3ECE7]/50 mt-0.5">{quiz.prizePool} USDC prize pool</p>
            </div>

            <div className="p-4 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {step === 'loading' && (
                    <p className="text-xs text-[#F3ECE7]/40 animate-pulse">Loading claims...</p>
                )}

                {claims.map((claim) => (
                    <div key={claim.id} className="flex items-center gap-3">
                        <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getRankBadgeColor(claim.rank)}`}
                        >
                            {getRankLabel(claim.rank)}
                        </span>
                        <span className="text-sm text-[#F3ECE7] flex-1 truncate">
                            {claim.participant.nickname}
                        </span>
                        <span className="text-xs font-mono text-[#E84545]">
                            {claim.amount.toFixed(2)} USDC
                        </span>
                        <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                                claim.status === 'CLAIMED'
                                    ? 'bg-green-500/20 text-green-400'
                                    : claim.status === 'EXPIRED'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-neutral-500/20 text-neutral-400'
                            }`}
                        >
                            {claim.status}
                        </span>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-[#903749]/30">
                {step === 'ready' && (
                    <button
                        onClick={handleAuthorize}
                        className="w-full bg-[#E84545] hover:bg-[#E84545]/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        Approve Distribution
                    </button>
                )}

                {step === 'authorizing' && (
                    <div className="text-center">
                        <p className="text-xs text-[#F3ECE7]/60 animate-pulse">
                            Awaiting wallet signature...
                        </p>
                    </div>
                )}

                {step === 'finalizing' && (
                    <div className="text-center space-y-1">
                        <p className="text-xs text-[#F3ECE7]/60 animate-pulse">
                            Finalizing on-chain...
                        </p>
                        <p className="text-[10px] text-[#F3ECE7]/30">
                            Winner emails will be sent automatically
                        </p>
                    </div>
                )}

                {step === 'complete' && (
                    <div className="text-center space-y-1">
                        <p className="text-xs text-green-400 font-medium">
                            Distribution complete! Emails sent to winners.
                        </p>
                    </div>
                )}

                {step === 'error' && (
                    <div className="text-center space-y-2">
                        <p className="text-xs text-red-400">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setStep('ready');
                            }}
                            className="text-xs text-[#E84545] underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
