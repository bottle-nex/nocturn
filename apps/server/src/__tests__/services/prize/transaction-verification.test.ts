import { describe, it, expect } from 'vitest';
import {
    Keypair,
    TransactionInstruction,
    TransactionMessage,
    type VersionedTransactionResponse,
} from '@solana/web3.js';
import { verifyPrizeTransaction } from '../../../services/prize/transaction-verification';

const wallet = Keypair.generate().publicKey;
const escrow = Keypair.generate().publicKey;
const recipient = Keypair.generate().publicKey;
const mint = Keypair.generate().publicKey;
const programId = Keypair.generate().publicKey;
const expected = new TransactionInstruction({
    programId,
    data: Buffer.from('specific-quiz-and-claim'),
    keys: [
        { pubkey: wallet, isSigner: true, isWritable: true },
        { pubkey: escrow, isSigner: false, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
    ],
});
const transfer = { from: escrow, to: recipient, mint, recipient: wallet, amount: BigInt(20) };

function fixture(instruction = expected, versioned = false): VersionedTransactionResponse {
    const builder = new TransactionMessage({
        payerKey: wallet,
        recentBlockhash: Keypair.generate().publicKey.toBase58(),
        instructions: [instruction],
    });
    const message = versioned ? builder.compileToV0Message() : builder.compileToLegacyMessage();
    const keys = message.getAccountKeys();
    const balance = (address: typeof wallet, amount: string) => {
        let accountIndex = -1;
        for (let i = 0; i < keys.length; i++) if (keys.get(i)?.equals(address)) accountIndex = i;
        return {
            accountIndex,
            mint: mint.toBase58(),
            owner: wallet.toBase58(),
            uiTokenAmount: { amount, decimals: 6, uiAmount: null },
        };
    };
    return {
        slot: 1,
        blockTime: 100,
        transaction: { message, signatures: ['signature'] },
        meta: {
            err: null,
            fee: 5000,
            preBalances: [],
            postBalances: [],
            preTokenBalances: [balance(escrow, '100'), balance(recipient, '0')],
            postTokenBalances: [balance(escrow, '80'), balance(recipient, '20')],
        },
    };
}

describe('verifyPrizeTransaction', () => {
    it.each([false, true])(
        'accepts the exact successful instruction and transfer (versioned=%s)',
        (versioned) => {
            expect(verifyPrizeTransaction(fixture(expected, versioned), expected, transfer)).toBe(
                true,
            );
        },
    );

    it('rejects missing and failed transactions', () => {
        expect(verifyPrizeTransaction(null, expected, transfer)).toBe(false);
        const tx = fixture();
        if (tx.meta) tx.meta.err = { InstructionError: [0, 'Custom'] };
        expect(verifyPrizeTransaction(tx, expected, transfer)).toBe(false);
    });

    it('rejects a successful unrelated instruction or another claim token', () => {
        expect(
            verifyPrizeTransaction(
                fixture(
                    new TransactionInstruction({
                        ...expected,
                        programId: Keypair.generate().publicKey,
                    }),
                ),
                expected,
                transfer,
            ),
        ).toBe(false);
        expect(
            verifyPrizeTransaction(
                fixture(
                    new TransactionInstruction({ ...expected, data: Buffer.from('other-claim') }),
                ),
                expected,
                transfer,
            ),
        ).toBe(false);
    });

    it('rejects the right data with the wrong escrow', () => {
        const instruction = new TransactionInstruction({
            ...expected,
            keys: expected.keys.map((key, index) =>
                index === 1 ? { ...key, pubkey: Keypair.generate().publicKey } : key,
            ),
        });
        expect(verifyPrizeTransaction(fixture(instruction), expected, transfer)).toBe(false);
    });

    it('requires the expected recipient to sign', () => {
        const stranger = Keypair.generate().publicKey;
        const message = new TransactionMessage({
            payerKey: stranger,
            recentBlockhash: stranger.toBase58(),
            instructions: [
                new TransactionInstruction({
                    ...expected,
                    keys: expected.keys.map((key) => ({ ...key, isSigner: false })),
                }),
            ],
        }).compileToLegacyMessage();
        const tx = fixture();
        tx.transaction.message = message;
        expect(verifyPrizeTransaction(tx, expected)).toBe(false);
    });

    it('rejects incorrect transfer amounts and unrelated destination owners', () => {
        expect(
            verifyPrizeTransaction(fixture(), expected, { ...transfer, amount: BigInt(19) }),
        ).toBe(false);
        expect(
            verifyPrizeTransaction(fixture(), expected, {
                ...transfer,
                recipient: Keypair.generate().publicKey,
            }),
        ).toBe(false);
    });

    it('rejects a claimed instruction without an actual token balance change', () => {
        const tx = fixture();
        if (tx.meta) tx.meta.postTokenBalances = tx.meta.preTokenBalances;
        expect(verifyPrizeTransaction(tx, expected, transfer)).toBe(false);
    });

    it('rejects a transfer of the wrong token mint', () => {
        expect(
            verifyPrizeTransaction(fixture(), expected, {
                ...transfer,
                mint: Keypair.generate().publicKey,
            }),
        ).toBe(false);
    });
});
