import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
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

    // These are the mint and fee authority enforced by the deployed contract.
    private readonly usdcMint = new PublicKey('FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja');
    private readonly feeWallet = new PublicKey('DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR');
    private readonly tokenProgram = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

    public prize_addresses(quizId: string, hostWallet: string) {
        const [quizAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), new PublicKey(hostWallet).toBuffer()],
            this.program.programId,
        );
        const [escrow] = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), quizAccount.toBuffer()],
            this.program.programId,
        );
        const [escrowAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow_auth'), quizAccount.toBuffer()],
            this.program.programId,
        );
        return { quizAccount, escrow, escrowAuthority };
    }

    private token_account(owner: PublicKey) {
        return PublicKey.findProgramAddressSync(
            [owner.toBuffer(), this.tokenProgram.toBuffer(), this.usdcMint.toBuffer()],
            new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        )[0];
    }

    private async verify_instruction(
        signature: string,
        expected: TransactionInstruction,
        transfers: { account: PublicKey; delta: bigint; owner?: PublicKey }[] = [],
    ): Promise<boolean> {
        const tx = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!tx?.meta || tx.meta.err !== null) return false;
        const meta = tx.meta;
        const message = tx.transaction.message;
        const keys = message.getAccountKeys({ accountKeysFromLookups: tx.meta.loadedAddresses });
        const matches = message.compiledInstructions.some(
            (instruction) =>
                keys.get(instruction.programIdIndex)?.equals(expected.programId) &&
                Buffer.from(instruction.data).equals(expected.data) &&
                instruction.accountKeyIndexes.length === expected.keys.length &&
                expected.keys.every((account, i) => {
                    const index = instruction.accountKeyIndexes[i];
                    return (
                        index !== undefined &&
                        keys.get(index)?.equals(account.pubkey) &&
                        (!account.isSigner || message.isAccountSigner(index)) &&
                        (!account.isWritable || message.isAccountWritable(index))
                    );
                }),
        );
        if (!matches) return false;
        return transfers.every(({ account, delta, owner }) => {
            let index = -1;
            for (let i = 0; i < keys.length; i++) {
                if (keys.get(i)?.equals(account)) index = i;
            }
            const pre = meta.preTokenBalances?.find((balance) => balance.accountIndex === index);
            const post = meta.postTokenBalances?.find((balance) => balance.accountIndex === index);
            if (
                !post ||
                post.mint !== this.usdcMint.toBase58() ||
                (pre && pre.mint !== post.mint) ||
                (owner && post.owner !== owner.toBase58())
            )
                return false;
            return (
                BigInt(post.uiTokenAmount.amount) - BigInt(pre?.uiTokenAmount.amount ?? '0') ===
                delta
            );
        });
    }

    public async verify_stake_tx(
        signature: string,
        quizId: string,
        hostId: string,
        hostWallet: string,
        amount: bigint,
    ): Promise<{ valid: boolean; baseUnits: bigint; escrowPda: string; quizAccountPda: string }> {
        const { quizAccount, escrow, escrowAuthority } = this.prize_addresses(quizId, hostWallet);
        const baseUnits = amount - amount / BigInt(100); // Contract fee: amount / 100 * 1.
        const result = {
            baseUnits,
            escrowPda: escrow.toBase58(),
            quizAccountPda: quizAccount.toBase58(),
        };
        if (amount <= BigInt(0)) return { ...result, valid: false };
        const host = new PublicKey(hostWallet);
        const instruction = await this.program.methods
            .createQuiz(quizId, hostId, new BN(amount.toString()))
            .accounts({
                host,
                hostTokenAccount: this.token_account(host),
                nocturnTokenAccount: this.token_account(this.feeWallet),
            })
            .instruction();
        return {
            ...result,
            valid: await this.verify_instruction(signature, instruction, [
                { account: escrow, delta: baseUnits, owner: escrowAuthority },
            ]),
        };
    }

    public async verify_authorize_tx(signature: string, quizId: string, hostWallet: string) {
        const instruction = await this.program.methods
            .authorizePlatform(quizId, this.platformPublicKey)
            .accounts({ host: new PublicKey(hostWallet) })
            .instruction();
        return this.verify_instruction(signature, instruction);
    }

    public async verify_claim_tx(
        signature: string,
        quizId: string,
        token: string,
        hostWallet: string,
        claimerWallet: string,
        amount: bigint,
    ) {
        const { quizAccount, escrow, escrowAuthority } = this.prize_addresses(quizId, hostWallet);
        const [claimAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(token)],
            this.program.programId,
        );
        const claimer = new PublicKey(claimerWallet);
        const destination = this.token_account(claimer);
        const instruction = await this.program.methods
            .claimPrize(quizId, token)
            .accountsPartial({
                quizAccount,
                escrowAuthority,
                escrowTokenAccount: escrow,
                claimAccount,
                claimer,
                claimerTokenAccount: destination,
            })
            .instruction();
        return this.verify_instruction(signature, instruction, [
            { account: escrow, delta: -amount, owner: escrowAuthority },
            { account: destination, delta: amount, owner: claimer },
        ]);
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
    ): Promise<string | void> {
        const hostPubkey = new PublicKey(hostWalletPubkey);

        const [quizAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
            this.program.programId,
        );

        const [claimAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(claimToken)],
            this.program.programId,
        );

        const existing = await this.program.account.claimAccount.fetchNullable(claimAccountPda);
        if (existing) {
            if (
                existing.quizId !== quizId ||
                existing.claimToken !== claimToken ||
                existing.amount.toString() !== amountBaseUnits.toString() ||
                existing.rank !== rank ||
                existing.expiresAt.toNumber() !== expiresAt ||
                !Buffer.from(existing.winnerEmailHash).equals(Buffer.from(winnerEmailHash))
            ) {
                throw new Error('Existing on-chain claim does not match prize claim');
            }
            return;
        }

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

    public async seal_quiz_onchain(
        quizId: string,
        hostWalletPubkey: string,
    ): Promise<string | void> {
        const hostPubkey = new PublicKey(hostWalletPubkey);

        const [quizAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), hostPubkey.toBytes()],
            this.program.programId,
        );

        const existing = await this.program.account.quizAccountShape.fetch(quizAccountPda);
        if (existing.isFinalized) return;

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
