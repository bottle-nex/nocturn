import { required } from '../helpers/required';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    AddressLookupTableAccount,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    TransactionMessage,
} from '@solana/web3.js';
import { BN } from '@nocturn/contract';
import SolanaService from '../../services/solana/service.solana';

vi.mock('../../configs/env', async () => {
    const { Keypair } = await import('@solana/web3.js');
    const { default: bs58 } = await import('bs58');
    return {
        env: {
            SERVER_SOLANA_RPC_URL: 'http://localhost:8899',
            SERVER_PLATFORM_AUTHORITY_KEYPAIR: bs58.encode(Keypair.generate().secretKey),
        },
    };
});

const host = Keypair.generate().publicKey;
const claimer = Keypair.generate().publicKey;
const mint = new PublicKey('FNvGsacFM6ApWceMkqyg3NWoZZqeHizZk9Q3ZSJMmkja');
const quizId = 'quiz-id';
const token = '0123456789abcdef0123456789abcdef';
let service: SolanaService;
const rpc = vi.spyOn(Connection.prototype, 'getTransaction');

function transaction(instruction: TransactionInstruction, versioned = false) {
    const builder = new TransactionMessage({
        payerKey: host,
        recentBlockhash: PublicKey.default.toBase58(),
        instructions: [instruction],
    });
    const table = new AddressLookupTableAccount({
        key: Keypair.generate().publicKey,
        state: {
            deactivationSlot: BigInt('18446744073709551615'),
            lastExtendedSlot: 0,
            lastExtendedSlotStartIndex: 0,
            addresses: instruction.keys.filter((k) => !k.isSigner).map((k) => k.pubkey),
        },
    });
    const message = versioned
        ? builder.compileToV0Message([table])
        : builder.compileToLegacyMessage();
    const loadedAddresses = versioned
        ? message.getAccountKeys({ addressLookupTableAccounts: [table] }).accountKeysFromLookups
        : undefined;
    const keys = message.getAccountKeys({ accountKeysFromLookups: loadedAddresses });
    const { escrow, escrowAuthority } = service.prize_addresses(quizId, host.toBase58());
    const destination = service['token_account'](claimer);
    const balance = (account: PublicKey, amount: string, owner: PublicKey) => ({
        accountIndex:
            Array.from({ length: keys.length }, (_, i) => i).find((i) =>
                keys.get(i)?.equals(account),
            ) ?? -1,
        mint: mint.toBase58(),
        owner: owner.toBase58(),
        uiTokenAmount: { amount, decimals: 6, uiAmount: null },
    });
    return {
        slot: 1,
        blockTime: 1,
        transaction: { message, signatures: ['signature'] },
        meta: {
            err: null,
            fee: 5000,
            preBalances: [],
            postBalances: [],
            loadedAddresses,
            preTokenBalances: [
                balance(escrow, '0', escrowAuthority),
                balance(destination, '0', claimer),
            ],
            postTokenBalances: [
                balance(escrow, '99000000', escrowAuthority),
                balance(destination, '0', claimer),
            ],
        },
    };
}

async function stake(amount = '100000000', id = quizId) {
    return service['program'].methods
        .createQuiz(id, 'host-id', new BN(amount))
        .accounts({
            host,
            hostTokenAccount: service['token_account'](host),
            nocturnTokenAccount: service['token_account'](
                new PublicKey('DsGpvUYdJs7SRpXfST2N4EebKLsXq4SyoYvN3cyJ7uBR'),
            ),
        })
        .instruction();
}
const verifyStake = () =>
    service.verify_stake_tx('signature', quizId, 'host-id', host.toBase58(), BigInt(100000000));

beforeEach(() => {
    vi.clearAllMocks();
    service = new SolanaService();
});

describe('stake transaction proof', () => {
    it.each([false, true])(
        'accepts the exact stake, including versioned lookup accounts: %s',
        async (v0) => {
            rpc.mockResolvedValue(transaction(await stake(), v0));
            expect(await verifyStake()).toMatchObject({
                valid: true,
                baseUnits: BigInt(99000000),
                escrowPda: service.prize_addresses(quizId, host.toBase58()).escrow.toBase58(),
            });
        },
    );
    it('rejects an unrelated successful transfer', async () => {
        rpc.mockResolvedValue(
            transaction(
                SystemProgram.transfer({ fromPubkey: host, toPubkey: claimer, lamports: 1 }),
            ),
        );
        expect((await verifyStake()).valid).toBe(false);
    });
    it.each([
        'program',
        'quiz',
        'amount',
        'mint',
        'escrow',
        'signer',
        'balance',
        'failed',
        'missing',
    ])('rejects wrong %s', async (wrong) => {
        const ix = await stake(
            wrong === 'amount' ? '100' : '100000000',
            wrong === 'quiz' ? 'other-quiz' : quizId,
        );
        if (wrong === 'program') ix.programId = SystemProgram.programId;
        if (wrong === 'mint') required(ix.keys[1]).pubkey = Keypair.generate().publicKey;
        if (wrong === 'escrow') required(ix.keys[3]).pubkey = Keypair.generate().publicKey;
        if (wrong === 'signer')
            required(ix.keys.find((key) => key.pubkey.equals(host))).pubkey = claimer;
        const tx = transaction(ix);
        if (wrong === 'balance') required(tx.meta.postTokenBalances[0]).uiTokenAmount.amount = '1';
        rpc.mockResolvedValue(
            wrong === 'missing'
                ? null
                : wrong === 'failed'
                  ? {
                        ...tx,
                        meta: { ...tx.meta, err: { InstructionError: [0, 'InvalidArgument'] } },
                    }
                  : tx,
        );
        expect((await verifyStake()).valid).toBe(false);
    });
});

describe('authorization proof', () => {
    it.each([false, true])('checks the authorized platform key: wrong=%s', async (wrong) => {
        const ix = await service['program'].methods
            .authorizePlatform(quizId, wrong ? claimer : service.platformPublicKey)
            .accounts({ host })
            .instruction();
        rpc.mockResolvedValue(transaction(ix));
        expect(await service.verify_authorize_tx('signature', quizId, host.toBase58())).toBe(
            !wrong,
        );
    });
    it('rejects a valid stake as authorization', async () => {
        rpc.mockResolvedValue(transaction(await stake()));
        expect(await service.verify_authorize_tx('signature', quizId, host.toBase58())).toBe(false);
    });
});

describe('claim proof', () => {
    it.each(['valid', 'token', 'wallet', 'amount', 'mint'])('checks claim %s', async (wrong) => {
        const { quizAccount, escrow, escrowAuthority } = service.prize_addresses(
            quizId,
            host.toBase58(),
        );
        const [claimAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from(quizId), Buffer.from(token)],
            service['program'].programId,
        );
        const ix = await service['program'].methods
            .claimPrize(quizId, token)
            .accountsPartial({
                quizAccount,
                escrowAuthority,
                escrowTokenAccount: escrow,
                claimAccount,
                claimer,
                claimerTokenAccount: service['token_account'](claimer),
            })
            .instruction();
        const tx = transaction(ix);
        required(tx.meta.preTokenBalances[0]).uiTokenAmount.amount = '100000000';
        required(tx.meta.postTokenBalances[0]).uiTokenAmount.amount = '99000000';
        required(tx.meta.postTokenBalances[1]).uiTokenAmount.amount =
            wrong === 'amount' ? '1' : '1000000';
        if (wrong === 'mint')
            required(tx.meta.postTokenBalances[1]).mint = PublicKey.default.toBase58();
        rpc.mockResolvedValue(tx);
        expect(
            await service.verify_claim_tx(
                'signature',
                quizId,
                wrong === 'token' ? 'other-token' : token,
                host.toBase58(),
                wrong === 'wallet' ? host.toBase58() : claimer.toBase58(),
                BigInt(1000000),
            ),
        ).toBe(wrong === 'valid');
    });
});

describe('on-chain finalization recovery', () => {
    it('recognizes an exact existing claim after an interrupted confirmation', async () => {
        vi.spyOn(service['program'].account.claimAccount, 'fetchNullable').mockResolvedValue({
            quizId,
            claimToken: token,
            winnerEmailHash: Array(32).fill(1),
            amount: new BN(1000000),
            rank: 1,
            isClaimed: false,
            claimedAt: new BN(0),
            claimerPubkey: PublicKey.default,
            expiresAt: new BN(100),
            bump: 1,
        });
        const send = vi.spyOn(service['program'].provider, 'sendAndConfirm');
        await service.finalize_quiz_onchain(
            quizId,
            token,
            Array(32).fill(1),
            BigInt(1000000),
            1,
            100,
            host.toBase58(),
        );
        expect(send).not.toHaveBeenCalled();
        await expect(
            service.finalize_quiz_onchain(
                quizId,
                token,
                Array(32).fill(1),
                BigInt(2),
                1,
                100,
                host.toBase58(),
            ),
        ).rejects.toThrow('Existing on-chain claim does not match');
    });
    it('does not seal an already sealed quiz again', async () => {
        vi.spyOn(service['program'].account.quizAccountShape, 'fetch').mockResolvedValue({
            quizId,
            prize: new BN(1000000),
            hostPubKey: host,
            hostId: 'host-id',
            isFinalized: true,
            totalWinners: 1,
            totalClaimed: 0,
            totalRefunded: new BN(0),
            isCancelled: false,
            claimExpiry: new BN(100),
            platformAuthority: service.platformPublicKey,
            bump: 1,
            escrowBump: 1,
        });
        const send = vi.spyOn(service['program'].provider, 'sendAndConfirm');
        await service.seal_quiz_onchain(quizId, host.toBase58());
        expect(send).not.toHaveBeenCalled();
    });
});
