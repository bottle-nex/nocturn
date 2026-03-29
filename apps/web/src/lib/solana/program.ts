import { AnchorProvider, Program } from '@nocturn/contract';
import { Connection, PublicKey } from '@solana/web3.js';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { createProgram, type Contract } from '@nocturn/contract';

export const PROGRAM_ID = new PublicKey('8Gj7Nuc8uQZjA9h4XrfQ7RCbuKFW74mhk6nbQ8cdjZue');
export const NOCTURN_FEE_WALLET = new PublicKey('DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR');

export function getProgram(connection: Connection, wallet: AnchorWallet): Program<Contract> {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });
    return createProgram(provider);
}

export function getQuizPda(quizId: string, hostPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
        PROGRAM_ID,
    );
}

export function getEscrowPda(quizAccountPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), quizAccountPda.toBytes()],
        PROGRAM_ID,
    );
}

export function getClaimPda(quizId: string, claimToken: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(claimToken)],
        PROGRAM_ID,
    );
}

// SPL Token Mint for prize payments
// DEVNET:  Custom test token (FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja)
// MAINNET: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (real USDC)
export const USDC_MINT = new PublicKey(
    process.env.NEXT_PUBLIC_USDC_MINT ?? 'FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja',
);
export const USDC_DECIMALS = 6;

export function getEscrowAuthorityPda(quizAccountPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('escrow_auth'), quizAccountPda.toBytes()],
        PROGRAM_ID,
    );
}

export default class NocturnProgram {
    public readonly PROGRAM_ID = new PublicKey('8Gj7Nuc8uQZjA9h4XrfQ7RCbuKFW74mhk6nbQ8cdjZue');
    public readonly NOCTURN_FEE_WALLET = new PublicKey(
        'DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR',
    );
}
