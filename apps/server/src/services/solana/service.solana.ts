import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { env } from '../../configs/env';
import {
    createProgram,
    AnchorProvider,
    BN,
    Wallet,
    type Program,
    type Contract,
} from '@nocturn/contract';

export default class SolanaService {
    public connection: Connection;
    public platformKeypair: Keypair;
    public platformPublicKey: PublicKey;
    private program: Program<Contract>;

    constructor() {
        this.connection = new Connection(env.SERVER_SOLANA_RPC_URL, 'confirmed');
        const secretKey = bs58.decode(env.SERVER_PLATFORM_AUTHORITY_KEYPAIR);
        this.platformKeypair = Keypair.fromSecretKey(secretKey);
        this.platformPublicKey = this.platformKeypair.publicKey;

        const wallet = new Wallet(this.platformKeypair);
        const provider = new AnchorProvider(this.connection, wallet, { commitment: 'confirmed' });
        this.program = createProgram(provider);

        console.log(`[SolanaService] Platform authority: ${this.platformPublicKey.toBase58()}`);
    }

    public async verify_transaction(txSignature: string): Promise<boolean> {
        const maxRetries = 3;
        const delayMs = 2000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const tx = await this.connection.getTransaction(txSignature, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                });
                if (tx !== null && tx.meta !== null && tx.meta.err === null) {
                    return true;
                }
            } catch (error) {
                console.error(`verify_transaction attempt ${attempt + 1} failed:`, error);
            }
            if (attempt < maxRetries - 1) {
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
        return false;
    }

    public async verify_stake_tx(
        tx_signature: string,
        escrow_pda: string,
    ): Promise<{ valid: boolean; baseUnits?: number }> {
        try {
            const maxRetries = 3;
            const delayMs = 2000;
            let tx = null;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                tx = await this.connection.getTransaction(tx_signature, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                });
                if (tx !== null) break;
                if (attempt < maxRetries - 1) {
                    await new Promise((r) => setTimeout(r, delayMs));
                }
            }

            if (!tx || !tx.meta || tx.meta.err !== null) {
                return { valid: false };
            }
            const accounts = tx.transaction.message.getAccountKeys();
            let escrowIndex = -1;
            for (let i = 0; i < accounts.length; i++) {
                if (accounts.get(i)?.equals(new PublicKey(escrow_pda))) {
                    escrowIndex = i;
                    break;
                }
            }
            if (escrowIndex === -1) {
                return { valid: false };
            }
            const preTokenBal = tx.meta.preTokenBalances?.find(b => b.accountIndex === escrowIndex);
            const postTokenBal = tx.meta.postTokenBalances?.find(b => b.accountIndex === escrowIndex);
            const pre = preTokenBal ? Number(preTokenBal.uiTokenAmount.amount) : 0;
            const post = postTokenBal ? Number(postTokenBal.uiTokenAmount.amount) : 0;
            const diff = post - pre;
            if (diff > 0) {
                return { valid: true, baseUnits: diff };
            } else {
                return { valid: false };
            }
        } catch (error) {
            console.error('Error occurred while verifying stake transaction:', error);
            return { valid: false };
        }
    }

    public async get_balance(pubkey: PublicKey): Promise<number> {
        return this.connection.getBalance(pubkey);
    }

    public async finalize_quiz_onchain(
        quizId: string,
        claimToken: string,
        winnerEmailHash: number[],
        amountBaseUnits: bigint,
        rank: number,
        expiresAt: number,
    ): Promise<string> {
        const tx = await this.program.methods
            .finalizeQuiz(
                quizId,
                claimToken,
                winnerEmailHash,
                new BN(amountBaseUnits.toString()),
                rank,
                new BN(expiresAt),
            )
            .accounts({
                platformAuthority: this.platformPublicKey,
            })
            .rpc();

        return tx;
    }

    public async seal_quiz_onchain(quizId: string): Promise<string> {
        const tx = await this.program.methods
            .sealQuiz(quizId)
            .accounts({
                platformAuthority: this.platformPublicKey,
            })
            .rpc();

        return tx;
    }
}
