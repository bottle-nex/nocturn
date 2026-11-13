import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { PublicKey } from '@solana/web3.js';
import { buildTestApp } from '../../helpers/app.helper.ts';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper.ts';
import prizeRouter from '../../../routes/prize.router.ts';

vi.hoisted(() => {
    process.env.SERVER_PLATFORM_AUTHORITY_KEYPAIR = 'test-platform-key';
});

const mocks = vi.hoisted(() => ({
    quiz: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    prizeClaim: { findFirst: vi.fn(), updateMany: vi.fn() },
    solana: {
        get_escrow_state: vi.fn(),
        get_refund_claim: vi.fn(),
        refund_instruction: vi.fn(),
        build_refund_transaction: vi.fn(),
        verify_refund_transaction: vi.fn(),
    },
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        quiz: mocks.quiz,
        prizeClaim: mocks.prizeClaim,
        $transaction: async (fn: (tx: typeof mocks) => Promise<void>) => fn(mocks),
    },
}));
vi.mock('../../../services/init.services.ts', () => ({ solanaServiceInstance: mocks.solana }));

const app = buildTestApp(prizeRouter);
const hostTokenAccount = PublicKey.default.toBase58();
const quiz = {
    id: 'quiz',
    hostId: TEST_USER.id,
    status: 'CREATED',
    escrowPda: 'escrow',
    hostWalletPubkey: hostTokenAccount,
    title: 'Quiz',
    prizeClaims: [],
};
const claim = {
    id: 'claim',
    quizId: 'quiz',
    claimToken: 'token',
    status: 'PENDING',
    rank: 1,
    amountBaseUnits: BigInt(1000000),
};
const state = {
    cancelled: false,
    finalized: false,
    balanceBaseUnits: '1000000',
    refundedBaseUnits: '0',
};
const payload = { hostTokenAccount, claimId: claim.id, txSignature: 'signature' };
function post(path: string, body = payload) {
    return request(app)
        .post(`/api/v1/prize/${path}`)
        .set('Authorization', bearerHeader())
        .send(body);
}

beforeEach(() => {
    vi.resetAllMocks();
    mocks.quiz.findFirst.mockResolvedValue(quiz);
    mocks.quiz.findMany.mockResolvedValue([quiz]);
    mocks.prizeClaim.findFirst.mockResolvedValue(claim);
    mocks.solana.get_escrow_state.mockResolvedValue(state);
    mocks.solana.get_refund_claim.mockResolvedValue({
        claimed: false,
        expiresAt: Date.now() - 1000,
    });
    mocks.solana.refund_instruction.mockResolvedValue('instruction');
    mocks.solana.build_refund_transaction.mockResolvedValue('serialized');
    mocks.solana.verify_refund_transaction.mockResolvedValue(true);
});

describe('host refunds', () => {
    it('requires authentication', async () => {
        await request(app).post('/api/v1/prize/cancel/quiz').send(payload).expect(401);
        await request(app).get('/api/v1/prize/escrows').expect(401);
        expect(mocks.quiz.findFirst).not.toHaveBeenCalled();
    });
    it('restricts lookup to the authenticated host', async () => {
        mocks.quiz.findFirst.mockResolvedValue(null);
        await post('cancel/quiz').expect(404);
        expect(mocks.quiz.findFirst).toHaveBeenCalledWith({
            where: { id: 'quiz', hostId: TEST_USER.id },
        });
    });
    it('rejects malformed token accounts', async () => {
        await post('cancel/quiz', { ...payload, hostTokenAccount: 'invalid' }).expect(400);
        expect(mocks.solana.refund_instruction).not.toHaveBeenCalled();
    });
    it('builds an unsigned cancellation without changing persisted state', async () => {
        const response = await post('cancel/quiz').expect(200);
        expect(response.body.data.transaction).toBe('serialized');
        expect(mocks.solana.refund_instruction).toHaveBeenCalledWith(
            'quiz',
            hostTokenAccount,
            hostTokenAccount,
            undefined,
        );
        expect(mocks.quiz.update).not.toHaveBeenCalled();
    });
    it.each(['LIVE', 'PAYOUT_PENDING', 'COMPLETED'])(
        'does not cancel a %s quiz',
        async (status) => {
            mocks.quiz.findFirst.mockResolvedValue({ ...quiz, status });
            await post('cancel/quiz').expect(409);
        },
    );
    it('offers cancellation for a timed-out stake', async () => {
        mocks.quiz.findFirst.mockResolvedValue({ ...quiz, status: 'TIMED_OUT' });
        await post('cancel/quiz').expect(200);
    });
    it.each([
        { ...state, finalized: true },
        { ...state, cancelled: true },
    ])('rejects unavailable cancellation', async (value) => {
        mocks.solana.get_escrow_state.mockResolvedValue(value);
        await post('cancel/quiz').expect(409);
    });
    it('requires a claim belonging to the quiz', async () => {
        mocks.prizeClaim.findFirst.mockResolvedValue(null);
        await post('reclaim/quiz').expect(404);
        expect(mocks.prizeClaim.findFirst).toHaveBeenCalledWith({
            where: { id: claim.id, quizId: quiz.id },
        });
    });
    it('builds a reclaim from on-chain expiry even before the daily job runs', async () => {
        mocks.solana.get_escrow_state.mockResolvedValue({ ...state, finalized: true });
        await post('reclaim/quiz').expect(200);
        expect(mocks.solana.refund_instruction).toHaveBeenCalledWith(
            'quiz',
            hostTokenAccount,
            hostTokenAccount,
            'token',
        );
    });
    it.each([
        null,
        { claimed: true, expiresAt: 0 },
        { claimed: false, expiresAt: Date.now() + 86400000 },
    ])('rejects missing, consumed, or unexpired on-chain claims', async (value) => {
        mocks.solana.get_escrow_state.mockResolvedValue({ ...state, finalized: true });
        mocks.solana.get_refund_claim.mockResolvedValue(value);
        await post('reclaim/quiz').expect(409);
    });
    it('does not update records for an invalid refund transaction', async () => {
        mocks.solana.verify_refund_transaction.mockResolvedValue(false);
        await post('cancel/quiz/confirm').expect(400);
        expect(mocks.quiz.update).not.toHaveBeenCalled();
        expect(mocks.prizeClaim.updateMany).not.toHaveBeenCalled();
    });
    it('confirms cancellation repeatedly after the on-chain cancellation', async () => {
        mocks.solana.get_escrow_state.mockResolvedValue({ ...state, cancelled: true });
        await post('cancel/quiz/confirm').expect(200);
        await post('cancel/quiz/confirm').expect(200);
        expect(mocks.quiz.update).toHaveBeenCalledWith({
            where: { id: 'quiz' },
            data: { status: 'CANCELLED', endedAt: expect.any(Date) },
        });
        expect(mocks.solana.get_escrow_state).not.toHaveBeenCalled();
    });
    it('records only the verified reclaimed claim as refunded', async () => {
        await post('reclaim/quiz/confirm').expect(200);
        expect(mocks.prizeClaim.updateMany).toHaveBeenCalledWith({
            where: { quizId: 'quiz', id: 'claim', status: { in: ['PENDING', 'EXPIRED'] } },
            data: { status: 'REFUNDED', txSignature: 'signature' },
        });
        expect(mocks.quiz.update).not.toHaveBeenCalled();
    });
    it('returns an error when RPC fails without mutating records', async () => {
        mocks.solana.get_escrow_state.mockRejectedValue(new Error('RPC unavailable'));
        await post('cancel/quiz').expect(500);
        expect(mocks.quiz.update).not.toHaveBeenCalled();
    });
    it('keeps escrow errors isolated in the dashboard response', async () => {
        mocks.solana.get_escrow_state.mockRejectedValue(new Error('RPC unavailable'));
        const response = await request(app)
            .get('/api/v1/prize/escrows')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data[0].error).toBe('Unable to load on-chain escrow state');
    });
    it('returns balances and eligible timed-out refunds', async () => {
        mocks.quiz.findMany.mockResolvedValue([{ ...quiz, status: 'TIMED_OUT' }]);
        const response = await request(app)
            .get('/api/v1/prize/escrows')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data[0]).toMatchObject({
            canCancel: true,
            balanceBaseUnits: '1000000',
            claims: [],
        });
    });
    it('handles an empty dashboard', async () => {
        mocks.quiz.findMany.mockResolvedValue([]);
        const response = await request(app)
            .get('/api/v1/prize/escrows')
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data).toEqual([]);
    });
});
