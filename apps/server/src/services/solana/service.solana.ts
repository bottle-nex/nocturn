import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
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
            const preTokenBal = tx.meta.preTokenBalances?.find(
                (b) => b.accountIndex === escrowIndex,
            );
            const postTokenBal = tx.meta.postTokenBalances?.find(
                (b) => b.accountIndex === escrowIndex,
            );
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

    private refund_accounts(quizId: string, hostWalletPubkey: string) {
        const host = new PublicKey(hostWalletPubkey);
        const [quizAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), host.toBuffer()],
            this.program.programId,
        );
        const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), quizAccount.toBuffer()],
            this.program.programId,
        );
        return { host, quizAccount, escrowTokenAccount };
    }

    public async get_escrow_state(quizId: string, hostWalletPubkey: string) {
        const accounts = this.refund_accounts(quizId, hostWalletPubkey);
        const state = await this.program.account.quizAccountShape.fetch(accounts.quizAccount);
        const balance = await this.connection.getTokenAccountBalance(accounts.escrowTokenAccount);
        return {
            cancelled: state.isCancelled,
            finalized: state.isFinalized,
            balanceBaseUnits: balance.value.amount,
            refundedBaseUnits: state.totalRefunded.toString(),
        };
    }

    public async get_refund_claim(quizId: string, claimToken: string) {
        const [address] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(claimToken)],
            this.program.programId,
        );
        const claim = await this.program.account.claimAccount.fetchNullable(address);
        return (
            claim && {
                claimed: claim.isClaimed,
                expiresAt: claim.expiresAt.toNumber() * 1000,
            }
        );
    }

    public async refund_instruction(
        quizId: string,
        hostWalletPubkey: string,
        hostTokenAccount: string,
        claimToken?: string,
    ): Promise<TransactionInstruction> {
        const accounts = {
            ...this.refund_accounts(quizId, hostWalletPubkey),
            hostTokenAccount: new PublicKey(hostTokenAccount),
        };
        const builder = claimToken
            ? this.program.methods.reclaimExpired(quizId, claimToken)
            : this.program.methods.cancelQuiz(quizId);
        return builder.accountsPartial(accounts).instruction();
    }

    public async build_refund_transaction(instruction: TransactionInstruction, host: string) {
        const transaction = new Transaction().add(instruction);
        transaction.feePayer = new PublicKey(host);
        transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
        return transaction.serialize({ requireAllSignatures: false }).toString('base64');
    }

    public async verify_refund_transaction(
        signature: string,
        instruction: TransactionInstruction,
        host: string,
    ): Promise<boolean> {
        const tx = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!tx?.meta || tx.meta.err !== null) return false;
        const message = tx.transaction.message;
        const keys = message.getAccountKeys({
            accountKeysFromLookups: tx.meta.loadedAddresses,
        });
        const hostKey = new PublicKey(host);
        const signedByHost = Array.from(
            { length: message.header.numRequiredSignatures },
            (_, index) => keys.get(index),
        ).some((key) => key?.equals(hostKey));
        if (!signedByHost) return false;
        return message.compiledInstructions.some(
            (ix) =>
                keys.get(ix.programIdIndex)?.equals(instruction.programId) &&
                Buffer.from(ix.data).equals(instruction.data) &&
                ix.accountKeyIndexes.length === instruction.keys.length &&
                instruction.keys.every((key, index) => {
                    const accountIndex = ix.accountKeyIndexes[index];
                    return accountIndex !== undefined && keys.get(accountIndex)?.equals(key.pubkey);
                }),
        );
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
        hostWalletPubkey: string,
    ): Promise<string> {
        const hostPubkey = new PublicKey(hostWalletPubkey);

        const [quizAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
            this.program.programId,
        );

        const [claimAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(claimToken)],
            this.program.programId,
        );

        const tx = await this.program.methods
            .finalizeQuiz(
                quizId,
                claimToken,
                winnerEmailHash,
                new BN(amountBaseUnits.toString()),
                rank,
                new BN(expiresAt),
            )
            .accountsPartial({
                quizAccount: quizAccountPda,
                claimAccount: claimAccountPda,
                platformAuthority: this.platformPublicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return tx;
    }

    public async seal_quiz_onchain(quizId: string, hostWalletPubkey: string): Promise<string> {
        const hostPubkey = new PublicKey(hostWalletPubkey);

        const [quizAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
            this.program.programId,
        );

        const tx = await this.program.methods
            .sealQuiz(quizId)
            .accountsPartial({
                quizAccount: quizAccountPda,
                platformAuthority: this.platformPublicKey,
            })
            .rpc();

        return tx;
    }
}
