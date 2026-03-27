import { BN, type Program } from '@nocturn/contract';
import { PublicKey } from '@solana/web3.js';
import type { Contract } from '@nocturn/contract';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { USDC_MINT, NOCTURN_FEE_WALLET } from './program';

export async function buildCreateQuizTx(
    program: Program<Contract>,
    quizId: string,
    hostId: string,
    amountBaseUnits: BN,
    hostPubkey: PublicKey,
) {
    const hostTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, hostPubkey);
    const nocturnTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, NOCTURN_FEE_WALLET);

    return program.methods
        .createQuiz(quizId, hostId, amountBaseUnits)
        .accounts({
            host: hostPubkey,
            hostTokenAccount,
            nocturnTokenAccount,
        })
        .transaction();
}

export async function buildAuthorizePlatformTx(
    program: Program<Contract>,
    quizId: string,
    platformPubkey: PublicKey,
    hostPubkey: PublicKey,
) {
    return program.methods
        .authorizePlatform(quizId, platformPubkey)
        .accounts({
            host: hostPubkey,
        })
        .transaction();
}

export async function buildClaimPrizeTx(
    program: Program<Contract>,
    quizId: string,
    claimToken: string,
    claimerPubkey: PublicKey,
) {
    const claimerTokenAccount = getAssociatedTokenAddressSync(USDC_MINT, claimerPubkey);

    return program.methods
        .claimPrize(quizId, claimToken)
        .accounts({
            claimer: claimerPubkey,
            claimerTokenAccount,
        })
        .transaction();
}
