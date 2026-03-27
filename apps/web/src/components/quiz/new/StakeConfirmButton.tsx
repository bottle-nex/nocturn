'use client';

import { useState } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { BN } from '@nocturn/contract';
import axios from 'axios';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { CONFIRM_STAKE_URL } from 'routes/api_routes';
import { getProgram, getQuizPda, getEscrowPda } from '@/lib/solana/program';
import { buildCreateQuizTx } from '@/lib/solana/transactions';

type StakeStatus = 'idle' | 'signing' | 'confirming' | 'done' | 'error';

export default function StakeConfirmButton() {
    const [status, setStatus] = useState<StakeStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const { quiz } = useNewQuizStore();
    const { publicKey, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    const isReady =
        publicKey &&
        signTransaction &&
        anchorWallet &&
        quiz.id &&
        quiz.prizePool > 0 &&
        (quiz.prizeDistributions?.length ?? 0) > 0;

    async function handleStake() {
        if (!isReady) return;

        setStatus('signing');
        setError(null);

        try {
            const program = getProgram(connection, anchorWallet);
            const amountBaseUnits = new BN(Math.floor(quiz.prizePool * 1e6));

            const tx = await buildCreateQuizTx(
                program,
                quiz.id,
                quiz.hostId || '',
                amountBaseUnits,
                publicKey,
            );

            tx.feePayer = publicKey;
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;

            const signed = await signTransaction(tx);
            const txSignature = await connection.sendRawTransaction(signed.serialize());

            setStatus('confirming');
            await connection.confirmTransaction(
                { signature: txSignature, blockhash, lastValidBlockHeight },
                'confirmed',
            );

            // Compute PDAs to send to backend
            const [quizAccountPda] = getQuizPda(quiz.id, publicKey);
            const [escrowPda] = getEscrowPda(quizAccountPda);

            await axios.post(
                `${CONFIRM_STAKE_URL}/${quiz.id}`,
                {
                    txSignature,
                    escrowPda: escrowPda.toBase58(),
                    quizAccountPda: quizAccountPda.toBase58(),
                    hostWalletPubkey: publicKey.toBase58(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );

            setStatus('done');
        } catch (err) {
            console.log('error is : ', err);
            setError('Failed to stake USDC. Please try again.');
            setStatus('error');
        }
    }

    if (status === 'done') {
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
            <button
                type="button"
                onClick={handleStake}
                disabled={!isReady || status === 'signing' || status === 'confirming'}
                className="w-full bg-[#E84545] hover:bg-[#E84545]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
                {status === 'signing'
                    ? 'Awaiting signature...'
                    : status === 'confirming'
                      ? 'Confirming on-chain...'
                      : `Stake ${quiz.prizePool || 0} USDC`}
            </button>

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
