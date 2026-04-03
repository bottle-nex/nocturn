import axios from 'axios';
import {
    CONFIRM_STAKE_URL,
    SET_PRIZE_DISTRIBUTION_URL,
    AUTHORIZE_CONFIRM_URL,
    GET_PRIZE_CLAIMS_URL,
    GET_CLAIM_URL,
    CONFIRM_CLAIM_URL,
} from 'routes/api_routes';
import { AnchorProvider, createProgram, BN, type Program, type Contract } from '@nocturn/contract';
import {
    Connection,
    PublicKey,
    type Transaction,
    type TransactionInstruction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddressSync,
    getAccount,
    createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import type { AnchorWallet } from '@solana/wallet-adapter-react';

export interface ConfirmStakePayload {
    txSignature: string;
    escrowPda: string;
    quizAccountPda: string;
    hostWalletPubkey: string;
}

export interface PrizeClaim {
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

export interface ClaimData {
    id: string;
    quizId: string;
    quizTitle: string;
    currency: string;
    hostWalletPubkey: string;
    participantName: string;
    participantAvatar: string | null;
    rank: number;
    amount: number;
    amountBaseUnits: string;
    status: string;
    claimedAt: string | null;
    claimerWallet: string | null;
    txSignature: string | null;
    expiresAt: string;
}

export default class SolanaAction {
    public static readonly PROGRAM_ID = new PublicKey(
        '8Gj7Nuc8uQZjA9h4XrfQ7RCbuKFW74mhk6nbQ8cdjZue',
    );
    public static readonly NOCTURN_FEE_WALLET = new PublicKey(
        'DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR',
    );
    public static readonly USDC_MINT = new PublicKey(
        process.env.NEXT_PUBLIC_USDC_MINT ?? 'FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja',
    );
    public static readonly USDC_DECIMALS = 6;

    // ── Program Setup ─────────────────────────────────────────────

    public static getProgram(connection: Connection, wallet: AnchorWallet): Program<Contract> {
        const provider = new AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        return createProgram(provider);
    }

    // ── PDA Derivations ───────────────────────────────────────────

    public static getQuizPda(quizId: string, hostPubkey: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
            SolanaAction.PROGRAM_ID,
        );
    }

    public static getEscrowPda(quizAccountPda: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), quizAccountPda.toBytes()],
            SolanaAction.PROGRAM_ID,
        );
    }

    public static getClaimPda(quizId: string, claimToken: string): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(claimToken)],
            SolanaAction.PROGRAM_ID,
        );
    }

    public static getEscrowAuthorityPda(quizAccountPda: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('escrow_auth'), quizAccountPda.toBytes()],
            SolanaAction.PROGRAM_ID,
        );
    }

    // ── Transaction Builders ──────────────────────────────────────

    public static async buildCreateQuizTx(
        program: Program<Contract>,
        quizId: string,
        hostId: string,
        amountBaseUnits: BN,
        hostPubkey: PublicKey,
    ) {
        const hostTokenAccount = getAssociatedTokenAddressSync(SolanaAction.USDC_MINT, hostPubkey);
        const nocturnTokenAccount = getAssociatedTokenAddressSync(
            SolanaAction.USDC_MINT,
            SolanaAction.NOCTURN_FEE_WALLET,
        );

        return program.methods
            .createQuiz(quizId, hostId, amountBaseUnits)
            .accounts({
                host: hostPubkey,
                hostTokenAccount,
                nocturnTokenAccount,
            })
            .transaction();
    }

    public static async buildAuthorizePlatformTx(
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

    public static async buildClaimPrizeTx(
        program: Program<Contract>,
        quizId: string,
        claimToken: string,
        claimerPubkey: PublicKey,
    ) {
        const claimerTokenAccount = getAssociatedTokenAddressSync(
            SolanaAction.USDC_MINT,
            claimerPubkey,
        );

        return program.methods
            .claimPrize(quizId, claimToken)
            .accounts({
                claimer: claimerPubkey,
                claimerTokenAccount,
            })
            .transaction();
    }

    // ── Transaction Helper ────────────────────────────────────────

    public static async signSendAndConfirm(
        connection: Connection,
        transaction: Transaction,
        publicKey: PublicKey,
        signTransaction: (tx: Transaction) => Promise<Transaction>,
    ): Promise<string> {
        transaction.feePayer = publicKey;
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const signed = await signTransaction(transaction);
        const txSignature = await connection.sendRawTransaction(signed.serialize());

        await connection.confirmTransaction(
            { signature: txSignature, blockhash, lastValidBlockHeight },
            'confirmed',
        );

        return txSignature;
    }

    // ── Balance Queries ───────────────────────────────────────────

    public static async getSolBalance(
        connection: Connection,
        publicKey: PublicKey,
    ): Promise<number> {
        const lamports = await connection.getBalance(publicKey);
        return lamports / 1e9;
    }

    public static async getUsdcBalance(
        connection: Connection,
        publicKey: PublicKey,
    ): Promise<number> {
        try {
            const ata = getAssociatedTokenAddressSync(SolanaAction.USDC_MINT, publicKey);
            const res = await connection.getTokenAccountBalance(ata);
            return Number(res.value.uiAmount ?? 0);
        } catch {
            return 0;
        }
    }

    // ── API Calls ─────────────────────────────────────────────────

    private static authHeaders(token: string) {
        return { headers: { Authorization: `Bearer ${token}` } };
    }

    public static async configureDistribution(
        token: string,
        quizId: string,
        percentages: number[],
    ): Promise<void> {
        const distributions = percentages.map((p, i) => ({ rank: i + 1, percentage: p }));
        await axios.post(
            `${SET_PRIZE_DISTRIBUTION_URL}/${quizId}`,
            { distributions },
            SolanaAction.authHeaders(token),
        );
    }

    public static async confirmStake(
        token: string,
        quizId: string,
        payload: ConfirmStakePayload,
    ): Promise<void> {
        await axios.post(
            `${CONFIRM_STAKE_URL}/${quizId}`,
            payload,
            SolanaAction.authHeaders(token),
        );
    }

    public static async authorizeConfirm(
        token: string,
        quizId: string,
        txSignature: string,
    ): Promise<void> {
        await axios.post(
            `${AUTHORIZE_CONFIRM_URL}/${quizId}`,
            { txSignature },
            SolanaAction.authHeaders(token),
        );
    }

    public static async fetchPrizeClaims(token: string, quizId: string): Promise<PrizeClaim[]> {
        const res = await axios.get(
            `${GET_PRIZE_CLAIMS_URL}/${quizId}`,
            SolanaAction.authHeaders(token),
        );
        return res.data.data;
    }

    public static async fetchClaimDetails(claimToken: string): Promise<ClaimData> {
        const res = await axios.get(`${GET_CLAIM_URL}/${claimToken}`);
        return res.data.data;
    }

    public static async confirmClaim(
        claimToken: string,
        txSignature: string,
        claimerWallet: string,
    ): Promise<{ success: boolean }> {
        const res = await axios.post(`${CONFIRM_CLAIM_URL}/${claimToken}/confirm`, {
            txSignature,
            claimerWallet,
        });
        return res.data;
    }

    public static async ensureUsdcAta(
        connection: Connection,
        publicKey: PublicKey,
    ): Promise<{ ata: PublicKey; createInstruction: TransactionInstruction | null }> {
        const ata = getAssociatedTokenAddressSync(SolanaAction.USDC_MINT, publicKey);
        try {
            await getAccount(connection, ata);
            return { ata, createInstruction: null };
        } catch {
            const createInstruction = createAssociatedTokenAccountInstruction(
                publicKey,
                ata,
                publicKey,
                SolanaAction.USDC_MINT,
            );
            return { ata, createInstruction };
        }
    }
}
