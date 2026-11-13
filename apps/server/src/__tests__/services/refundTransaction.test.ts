import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionMessage,
    TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import SolanaService from '../../services/solana/service.solana.ts';
import { env } from '../../configs/env.ts';

vi.hoisted(() => {
    process.env.SERVER_PLATFORM_AUTHORITY_KEYPAIR = 'test-platform-key';
});

const host = Keypair.generate();
const destination = Keypair.generate().publicKey;
let service: SolanaService;
beforeEach(() => {
    env.SERVER_PLATFORM_AUTHORITY_KEYPAIR = bs58.encode(Keypair.generate().secretKey);
    service = new SolanaService();
});

async function refund(claimToken?: string) {
    return service.refund_instruction(
        'quiz',
        host.publicKey.toBase58(),
        destination.toBase58(),
        claimToken,
    );
}
async function verify(
    options: {
        wrongHost?: boolean;
        wrongQuiz?: boolean;
        failed?: boolean;
        unrelated?: boolean;
        reclaim?: boolean;
        versioned?: boolean;
        wrongClaim?: boolean;
        wrongDestination?: boolean;
        wrongProgram?: boolean;
    } = {},
) {
    const expected = await refund(options.reclaim ? 'claim' : undefined);
    const signer = options.wrongHost ? Keypair.generate() : host;
    const actual = options.unrelated
        ? SystemProgram.transfer({
              fromPubkey: signer.publicKey,
              toPubkey: destination,
              lamports: 1,
          })
        : options.wrongQuiz
          ? await service.refund_instruction(
                'other-quiz',
                host.publicKey.toBase58(),
                destination.toBase58(),
            )
          : expected;
    const checkedInstruction = options.wrongClaim
        ? await service.refund_instruction(
              'quiz',
              host.publicKey.toBase58(),
              destination.toBase58(),
              'other-claim',
          )
        : options.wrongDestination
          ? await service.refund_instruction(
                'quiz',
                host.publicKey.toBase58(),
                Keypair.generate().publicKey.toBase58(),
            )
          : options.wrongProgram
            ? new TransactionInstruction({ ...expected, programId: SystemProgram.programId })
            : actual;
    const transaction = new Transaction({
        feePayer: signer.publicKey,
        recentBlockhash: PublicKey.default.toBase58(),
    }).add(checkedInstruction);
    const rpc = vi.spyOn(service.connection, 'getTransaction').mockResolvedValue({
        slot: 1,
        transaction: {
            message: options.versioned
                ? new TransactionMessage({
                      payerKey: signer.publicKey,
                      recentBlockhash: PublicKey.default.toBase58(),
                      instructions: [checkedInstruction],
                  }).compileToV0Message()
                : transaction.compileMessage(),
            signatures: [],
        },
        meta: {
            err: options.failed ? { InstructionError: [0, 'InvalidArgument'] } : null,
            fee: 5000,
            preBalances: [],
            postBalances: [],
        },
    });
    const valid = await service.verify_refund_transaction(
        'signature',
        expected,
        host.publicKey.toBase58(),
    );
    expect(rpc).toHaveBeenCalledWith('signature', {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
    });
    return valid;
}

describe('refund transaction verification', () => {
    it('accepts the exact cancellation signed by the staking wallet', async () => {
        expect(await verify()).toBe(true);
    });
    it('accepts the exact reclaim instruction', async () => {
        expect(await verify({ reclaim: true })).toBe(true);
    });
    it('accepts a versioned refund transaction', async () => {
        expect(await verify({ versioned: true })).toBe(true);
    });
    it('rejects a different reclaim token', async () => {
        expect(await verify({ reclaim: true, wrongClaim: true })).toBe(false);
    });
    it('rejects a different destination token account', async () => {
        expect(await verify({ wrongDestination: true })).toBe(false);
    });
    it('rejects an instruction to another program', async () => {
        expect(await verify({ wrongProgram: true })).toBe(false);
    });
    it('rejects an unrelated successful transaction', async () => {
        expect(await verify({ unrelated: true })).toBe(false);
    });
    it('rejects a cancellation for another quiz', async () => {
        expect(await verify({ wrongQuiz: true })).toBe(false);
    });
    it('requires the host among the transaction signers', async () => {
        expect(await verify({ wrongHost: true, unrelated: true })).toBe(false);
    });
    it('rejects failed on-chain execution', async () => {
        expect(await verify({ failed: true })).toBe(false);
    });
    it('rejects transactions not yet confirmed', async () => {
        vi.spyOn(service.connection, 'getTransaction').mockResolvedValue(null);
        expect(
            await service.verify_refund_transaction(
                'signature',
                await refund(),
                host.publicKey.toBase58(),
            ),
        ).toBe(false);
    });
    it('serializes an unsigned transaction paid by the host', async () => {
        vi.spyOn(service.connection, 'getLatestBlockhash').mockResolvedValue({
            blockhash: PublicKey.default.toBase58(),
            lastValidBlockHeight: 100,
        });
        const instruction = await refund();
        const encoded = await service.build_refund_transaction(
            instruction,
            host.publicKey.toBase58(),
        );
        const transaction = Transaction.from(Buffer.from(encoded, 'base64'));
        expect(transaction.feePayer?.equals(host.publicKey)).toBe(true);
        expect(transaction.instructions[0]?.data.equals(instruction.data)).toBe(true);
        expect(transaction.signature).toBeNull();
    });
});
