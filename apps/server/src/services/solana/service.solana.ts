import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import bs58 from 'bs58';
import { verifyPrizeTransaction } from '../prize/transaction-verification';
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

    public quiz_pda(quizId: string, hostWallet: string) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('quiz'), Buffer.from(quizId), new PublicKey(hostWallet).toBuffer()],
            this.program.programId,
        )[0];
    }

    public claim_pda(quizId: string, chainClaimId: string) {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(chainClaimId)],
            this.program.programId,
        )[0];
    }

    public async fetch_quiz(quizId: string, hostWallet: string) {
        return this.program.account.quizAccountShape.fetch(this.quiz_pda(quizId, hostWallet));
    }

    public async fetch_claim(quizId: string, chainClaimId: string) {
        return this.program.account.claimAccount.fetchNullable(
            this.claim_pda(quizId, chainClaimId),
        );
    }

    public async verify_authorization_tx(signature: string, quizId: string, hostWallet: string) {
        const account = await this.fetch_quiz(quizId, hostWallet);
        if (!account.platformAuthority.equals(this.platformPublicKey) || account.isCancelled)
            return false;
        if (!signature) return true;
        const expected = await this.program.methods
            .authorizePlatform(quizId, this.platformPublicKey)
            .accounts({ host: new PublicKey(hostWallet) })
            .instruction();
        const tx = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        return verifyPrizeTransaction(tx, expected);
    }

    public async verify_claim_tx(
        signature: string,
        quizId: string,
        chainClaimId: string,
        hostWallet: string,
        claimerWallet: string,
        amount: bigint,
        refund = false,
    ) {
        const tx = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!tx?.meta || tx.meta.err !== null) return null;
        const wallet = new PublicKey(claimerWallet);
        const mint = new PublicKey('FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja');
        const recipient = tx.meta.postTokenBalances?.find(
            (balance) => balance.owner === claimerWallet && balance.mint === mint.toBase58(),
        );
        const keys = tx.transaction.message.getAccountKeys(
            tx.meta.loadedAddresses
                ? { accountKeysFromLookups: tx.meta.loadedAddresses }
                : undefined,
        );
        const destination = recipient && keys.get(recipient.accountIndex);
        if (!destination) return null;
        const quizAccount = this.quiz_pda(quizId, hostWallet);
        const escrowAuthority = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow_auth'), quizAccount.toBuffer()],
            this.program.programId,
        )[0];
        const escrow = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), quizAccount.toBuffer()],
            this.program.programId,
        )[0];
        const expected = refund
            ? await this.program.methods
                  .reclaimExpired(quizId, chainClaimId)
                  .accountsPartial({
                      quizAccount,
                      escrowAuthority,
                      escrowTokenAccount: escrow,
                      claimAccount: this.claim_pda(quizId, chainClaimId),
                      hostTokenAccount: destination,
                      host: wallet,
                  })
                  .instruction()
            : await this.program.methods
                  .claimPrize(quizId, chainClaimId)
                  .accountsPartial({
                      quizAccount,
                      escrowAuthority,
                      escrowTokenAccount: escrow,
                      claimAccount: this.claim_pda(quizId, chainClaimId),
                      claimerTokenAccount: destination,
                      claimer: wallet,
                  })
                  .instruction();
        if (
            !verifyPrizeTransaction(tx, expected, {
                from: escrow,
                to: destination,
                mint,
                recipient: wallet,
                amount,
            })
        )
            return null;
        const claim = await this.fetch_claim(quizId, chainClaimId);
        if (
            !claim ||
            claim.quizId !== quizId ||
            !claim.isClaimed ||
            !claim.claimerPubkey.equals(wallet) ||
            claim.amount.toString() !== amount.toString()
        )
            return null;
        return { claimedAt: new Date(claim.claimedAt.toNumber() * 1000) };
    }

    public async reconcile_claim(
        quizId: string,
        claimToken: string,
        hostWallet: string,
        amount: bigint,
    ): Promise<{
        status: 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'REFUNDED';
        expiresAt: Date | null;
        claimedAt?: Date | null;
        claimerWallet?: string | null;
        txSignature?: string;
    }> {
        const account = await this.fetch_claim(quizId, claimToken);
        const quiz = await this.fetch_quiz(quizId, hostWallet);
        if (!account) {
            if (quiz.isFinalized) throw new Error('Finalized quiz has no claim account');
            return { status: 'PENDING' as const, expiresAt: null };
        }
        if (account.quizId !== quizId || account.amount.toString() !== amount.toString())
            throw new Error('Claim account does not match prize');
        const expiresAt = quiz.isFinalized ? new Date(quiz.claimExpiry.toNumber() * 1000) : null;
        if (account.isClaimed) {
            let before: string | undefined;
            while (true) {
                const signatures = await this.connection.getSignaturesForAddress(
                    this.claim_pda(quizId, claimToken),
                    { before, limit: 100 },
                    'confirmed',
                );
                if (!signatures.length) throw new Error('Claim settlement history is unavailable');
                for (const signature of signatures) {
                    if (signature.err) continue;
                    const wallet = account.claimerPubkey.toBase58();
                    const payment = await this.verify_claim_tx(
                        signature.signature,
                        quizId,
                        claimToken,
                        hostWallet,
                        wallet,
                        amount,
                    );
                    if (payment)
                        return {
                            status: 'CLAIMED' as const,
                            expiresAt,
                            claimedAt: payment.claimedAt,
                            claimerWallet: wallet,
                            txSignature: signature.signature,
                        };
                    if (wallet === hostWallet) {
                        const refund = await this.verify_claim_tx(
                            signature.signature,
                            quizId,
                            claimToken,
                            hostWallet,
                            wallet,
                            amount,
                            true,
                        );
                        if (refund)
                            return {
                                status: 'REFUNDED' as const,
                                expiresAt,
                                claimedAt: null,
                                claimerWallet: null,
                                txSignature: signature.signature,
                            };
                    }
                }
                before = signatures[signatures.length - 1]!.signature;
            }
        }
        const slot = await this.connection.getSlot('confirmed');
        const blockTime = await this.connection.getBlockTime(slot);
        if (blockTime === null) throw new Error('Chain time is unavailable');
        if (expiresAt && blockTime >= quiz.claimExpiry.toNumber()) {
            const current = await this.fetch_claim(quizId, claimToken);
            if (!current) throw new Error('Claim account disappeared during reconciliation');
            if (current.isClaimed)
                return this.reconcile_claim(quizId, claimToken, hostWallet, amount);
        }
        return {
            status:
                expiresAt && blockTime >= quiz.claimExpiry.toNumber()
                    ? ('EXPIRED' as const)
                    : ('PENDING' as const),
            expiresAt,
        };
    }

    public async verify_stake_tx(
        signature: string,
        escrowPda: string,
        quizId: string,
        hostId: string,
        hostWallet: string,
    ) {
        const quizPda = this.quiz_pda(quizId, hostWallet);
        const expectedEscrow = PublicKey.findProgramAddressSync(
            [Buffer.from('escrow'), quizPda.toBuffer()],
            this.program.programId,
        )[0];
        if (expectedEscrow.toBase58() !== escrowPda) return { valid: false };
        const account = await this.fetch_quiz(quizId, hostWallet);
        if (
            account.quizId !== quizId ||
            account.hostId !== hostId ||
            !account.hostPubKey.equals(new PublicKey(hostWallet)) ||
            account.isCancelled
        )
            return { valid: false };
        const tx = await this.connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
        });
        if (!tx?.meta || tx.meta.err !== null) return { valid: false };
        const mint = 'FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja';
        const keys = tx.transaction.message.getAccountKeys(
            tx.meta.loadedAddresses
                ? { accountKeysFromLookups: tx.meta.loadedAddresses }
                : undefined,
        );
        const tokenFor = (owner: string) => {
            const balance = tx.meta?.postTokenBalances?.find(
                (entry) => entry.owner === owner && entry.mint === mint,
            );
            return balance && keys.get(balance.accountIndex);
        };
        const hostTokenAccount = tokenFor(hostWallet);
        const nocturnTokenAccount = tokenFor('DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR');
        if (!hostTokenAccount || !nocturnTokenAccount) return { valid: false };
        const expected = await this.program.methods
            .createQuiz(quizId, hostId, account.prize)
            .accounts({
                host: new PublicKey(hostWallet),
                hostTokenAccount,
                nocturnTokenAccount,
            })
            .instruction();
        if (!verifyPrizeTransaction(tx, expected)) return { valid: false };
        const escrowBalance = tx.meta.postTokenBalances?.find((entry) =>
            keys.get(entry.accountIndex)?.equals(expectedEscrow),
        );
        const before = tx.meta.preTokenBalances?.find((entry) =>
            keys.get(entry.accountIndex)?.equals(expectedEscrow),
        );
        if (
            !escrowBalance ||
            escrowBalance.mint !== mint ||
            escrowBalance.uiTokenAmount.decimals !== 6 ||
            (before && before.uiTokenAmount.amount !== '0')
        )
            return { valid: false };
        const baseUnits = BigInt(escrowBalance.uiTokenAmount.amount);
        return { valid: baseUnits > BigInt(0), baseUnits: baseUnits.toString() };
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
