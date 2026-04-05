'use client';

import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { BN } from '@nocturn/contract';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import SolanaAction from '@/lib/solana/SolanaAction';
import { Button } from '@/components/ui/button';

type StakeStatus = 'idle' | 'signing' | 'confirming' | 'done' | 'error';

export default function StakeConfirmButton() {
    const [status, setStatus] = useState<StakeStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const { quiz } = useNewQuizStore();
    const { publicKey, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    const alreadyStaked = !!quiz.escrowPda;
    const isReady =
        publicKey &&
        signTransaction &&
        anchorWallet &&
        quiz.id &&
        quiz.prizePool > 0 &&
        (quiz.prizeDistributions?.length ?? 0) > 0 &&
        !alreadyStaked;
    async function handleStake() {
        if (!isReady) return;

        setStatus('signing');
        setError(null);

        try {
            const program = SolanaAction.getProgram(connection, anchorWallet);
            const amountBaseUnits = new BN(Math.floor(quiz.prizePool * 1e6));

            const tx = await SolanaAction.buildCreateQuizTx(
                program,
                quiz.id,
                quiz.hostId || '',
                amountBaseUnits,
                publicKey,
            );

            setStatus('confirming');
            const txSignature = await SolanaAction.signSendAndConfirm(
                connection,
                tx,
                publicKey,
                signTransaction,
            );

            const [quizAccountPda] = SolanaAction.getQuizPda(quiz.id, publicKey);
            const [escrowPda] = SolanaAction.getEscrowPda(quizAccountPda);

            await SolanaAction.confirmStake(localStorage.getItem('accessToken')!, quiz.id, {
                txSignature,
                escrowPda: escrowPda.toBase58(),
                quizAccountPda: quizAccountPda.toBase58(),
                hostWalletPubkey: publicKey.toBase58(),
            });

            setStatus('done');
        } catch {
            setError('Failed to stake USDC. Please try again.');
            setStatus('error');
        }
    }

    if (status === 'done' || alreadyStaked) {
        return (
            <div className="w-full px-2 mt-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-400 font-medium">
                        {quiz.prizePool} USDC staked successfully!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-2 mt-4 space-y-2">
            <Button
                type="button"
                onClick={handleStake}
                disabled={!isReady || status === 'signing' || status === 'confirming'}
                className="w-full bg-alpha disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
                {status === 'signing'
                    ? 'Awaiting signature...'
                    : status === 'confirming'
                      ? 'Confirming on-chain...'
                      : `Stake ${quiz.prizePool || 0} USDC`}
            </Button>

            {!publicKey && (
                <p className="text-xs text-neutral-500 text-center">
                    Connect your wallet first to stake USDC
                </p>
            )}

            {status === 'error' && error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
            )}
        </div>
    );
}
