import { describe, expect, it, vi } from 'vitest';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@nocturn/contract';
import SolanaService from '../../services/solana/service.solana';
import { hashClaimToken } from '../../utils/claim-token';

const mocks = vi.hoisted(() => ({ finalize: vi.fn(), accounts: vi.fn(), rpc: vi.fn() }));
vi.mock('@nocturn/contract', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@nocturn/contract')>();
    return {
        ...actual,
        createProgram: () => ({
            programId: new PublicKey('11111111111111111111111111111111'),
            methods: { finalizeQuiz: mocks.finalize },
        }),
    };
});
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

describe('on-chain claim finalization', () => {
    it('passes 32 hash bytes as both the instruction argument and PDA seed', async () => {
        mocks.finalize.mockReturnValue({ accountsPartial: mocks.accounts });
        mocks.accounts.mockReturnValue({ rpc: mocks.rpc });
        mocks.rpc.mockResolvedValue('transaction');
        const service = new SolanaService();
        const host = Keypair.generate().publicKey;
        const tokenHash = hashClaimToken('secret-token');
        await expect(
            service.finalize_quiz_onchain(
                'quiz',
                tokenHash,
                Array(32).fill(0),
                1000000n,
                1,
                2000000000,
                host.toBase58(),
            ),
        ).resolves.toBe('transaction');
        expect(mocks.finalize).toHaveBeenCalledWith(
            'quiz',
            Array.from(Buffer.from(tokenHash, 'hex')),
            Array(32).fill(0),
            new BN('1000000'),
            1,
            new BN(2000000000),
        );
        const [claimAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from('claim'), Buffer.from('quiz'), Buffer.from(tokenHash, 'hex')],
            new PublicKey('11111111111111111111111111111111'),
        );
        expect(mocks.accounts).toHaveBeenCalledWith(expect.objectContaining({ claimAccount }));
    });
});
