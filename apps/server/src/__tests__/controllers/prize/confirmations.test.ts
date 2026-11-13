import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { SubscriptionEnum } from '@nocturn/types';
import confirmStake from '../../../controllers/prize-controller/confirmStakeController';
import authorizeConfirm from '../../../controllers/prize-controller/authorizeConfirmController';
import confirmClaim from '../../../controllers/prize-controller/confirmClaimController';

const mocks = vi.hoisted(() => ({
    quiz: { findFirst: vi.fn(), update: vi.fn() },
    prizeClaim: { findUnique: vi.fn(), update: vi.fn() },
    prizeTransaction: { create: vi.fn(), findUnique: vi.fn() },
    verify_stake_tx: vi.fn(),
    verify_authorize_tx: vi.fn(),
    verify_claim_tx: vi.fn(),
    enqueue_finalization: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        quiz: mocks.quiz,
        prizeClaim: mocks.prizeClaim,
        $transaction: async (fn: (tx: typeof mocks) => Promise<unknown>) => fn(mocks),
    },
}));
vi.mock('../../../services/init.services', () => ({
    solanaServiceInstance: mocks,
    prizeQueueInstance: mocks,
}));

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    req.user = {
        id: 'host-id',
        name: 'Host',
        email: 'host@test.com',
        subscription: SubscriptionEnum.FREE,
    };
    next();
});
app.post('/stake/:quizId', confirmStake);
app.post('/authorize/:quizId', authorizeConfirm);
app.post('/claim/:token', confirmClaim);

const claim = {
    id: 'claim-id',
    claimToken: 'token',
    quizId: 'quiz-id',
    status: 'PENDING',
    amountBaseUnits: BigInt(1000000),
    emailHash: 'ab',
    rank: 1,
    expiresAt: new Date(Date.now() + 86400000),
    participant: { email: 'p@test.com', nickname: 'P' },
    quiz: { hostWalletPubkey: 'host-wallet' },
};
const quiz = {
    id: 'quiz-id',
    prizePool: 100,
    title: 'Quiz',
    escrowPda: 'escrow',
    quizAccountPda: 'quiz-account',
    hostWalletPubkey: 'host-wallet',
    resultsCreatedAt: new Date(),
    prizeClaims: [claim],
};

beforeEach(() => {
    vi.resetAllMocks();
    mocks.quiz.findFirst.mockResolvedValue(quiz);
    mocks.prizeClaim.findUnique.mockResolvedValue(claim);
    mocks.quiz.update.mockResolvedValue({ id: 'quiz-id' });
    mocks.prizeClaim.update.mockResolvedValue({ ...claim, status: 'CLAIMED' });
    mocks.verify_stake_tx.mockResolvedValue({
        valid: true,
        baseUnits: BigInt(99000000),
        escrowPda: 'derived-escrow',
        quizAccountPda: 'derived-quiz',
    });
    mocks.verify_authorize_tx.mockResolvedValue(true);
    mocks.verify_claim_tx.mockResolvedValue(true);
});

describe('confirm stake', () => {
    const body = {
        txSignature: 'sig',
        hostWalletPubkey: 'wallet',
        escrowPda: 'forged',
        quizAccountPda: 'forged',
    };
    beforeEach(() => mocks.quiz.findFirst.mockResolvedValue({ ...quiz, escrowPda: null }));
    it('uses the stored amount and server-derived addresses', async () => {
        await request(app).post('/stake/quiz-id').send(body).expect(200);
        expect(mocks.verify_stake_tx).toHaveBeenCalledWith(
            'sig',
            'quiz-id',
            'host-id',
            'wallet',
            BigInt(100000000),
        );
        expect(mocks.quiz.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    escrowPda: 'derived-escrow',
                    quizAccountPda: 'derived-quiz',
                    prizePool: 99,
                }),
            }),
        );
        expect(mocks.prizeTransaction.create).toHaveBeenCalledWith({
            data: { signature: 'sig', step: 'STAKE', referenceId: 'quiz-id' },
        });
    });
    it('rejects a failed proof without saving the stake', async () => {
        mocks.verify_stake_tx.mockResolvedValue({ valid: false });
        await request(app).post('/stake/quiz-id').send(body).expect(400);
        expect(mocks.quiz.update).not.toHaveBeenCalled();
    });
    it('rejects signature reuse atomically', async () => {
        mocks.prizeTransaction.create.mockRejectedValue({ code: 'P2002' });
        await request(app).post('/stake/quiz-id').send(body).expect(409);
        expect(mocks.quiz.update).not.toHaveBeenCalled();
    });
});

describe('confirm authorization', () => {
    it('rejects an unrelated transaction', async () => {
        mocks.verify_authorize_tx.mockResolvedValue(false);
        await request(app).post('/authorize/quiz-id').send({ txSignature: 'sig' }).expect(400);
        expect(mocks.enqueue_finalization).not.toHaveBeenCalled();
    });
    it('requires completed results', async () => {
        mocks.quiz.findFirst.mockResolvedValue({ ...quiz, resultsCreatedAt: null });
        await request(app).post('/authorize/quiz-id').send({ txSignature: 'sig' }).expect(400);
        expect(mocks.enqueue_finalization).not.toHaveBeenCalled();
    });
    it('records the proof before queueing', async () => {
        await request(app).post('/authorize/quiz-id').send({ txSignature: 'sig' }).expect(200);
        expect(mocks.verify_authorize_tx).toHaveBeenCalledWith('sig', 'quiz-id', 'host-wallet');
        expect(mocks.prizeTransaction.create).toHaveBeenCalledOnce();
        expect(mocks.enqueue_finalization).toHaveBeenCalledOnce();
    });
    it('allows the same proof to recover an enqueue failure', async () => {
        mocks.prizeTransaction.findUnique.mockResolvedValue({ signature: 'sig' });
        await request(app).post('/authorize/quiz-id').send({ txSignature: 'sig' }).expect(200);
        expect(mocks.prizeTransaction.create).not.toHaveBeenCalled();
        expect(mocks.enqueue_finalization).toHaveBeenCalledOnce();
    });
    it('rejects a second proof for the same quiz', async () => {
        mocks.prizeTransaction.findUnique.mockResolvedValue({ signature: 'first-sig' });
        mocks.prizeTransaction.create.mockRejectedValue({ code: 'P2002' });
        await request(app)
            .post('/authorize/quiz-id')
            .send({ txSignature: 'second-sig' })
            .expect(409);
        expect(mocks.enqueue_finalization).not.toHaveBeenCalled();
    });
});

describe('confirm claim', () => {
    it('checks the claim, wallet, and exact stored amount', async () => {
        await request(app)
            .post('/claim/token')
            .send({ txSignature: 'sig', claimerWallet: 'winner-wallet' })
            .expect(200);
        expect(mocks.verify_claim_tx).toHaveBeenCalledWith(
            'sig',
            'quiz-id',
            'token',
            'host-wallet',
            'winner-wallet',
            BigInt(1000000),
        );
        expect(mocks.prizeTransaction.create).toHaveBeenCalledWith({
            data: { signature: 'sig', step: 'CLAIM', referenceId: 'claim-id' },
        });
    });
    it('does not mark an unrelated transaction as claimed', async () => {
        mocks.verify_claim_tx.mockResolvedValue(false);
        await request(app)
            .post('/claim/token')
            .send({ txSignature: 'sig', claimerWallet: 'wallet' })
            .expect(400);
        expect(mocks.prizeClaim.update).not.toHaveBeenCalled();
    });
    it('reconciles a valid chain claim even if HTTP confirmation arrives after expiry', async () => {
        mocks.prizeClaim.findUnique.mockResolvedValue({
            ...claim,
            status: 'EXPIRED',
            expiresAt: new Date(0),
        });
        await request(app)
            .post('/claim/token')
            .send({ txSignature: 'sig', claimerWallet: 'wallet' })
            .expect(200);
    });
    it('rejects a concurrent confirmation that already changed the claim', async () => {
        mocks.prizeClaim.update.mockRejectedValue({ code: 'P2025' });
        await request(app)
            .post('/claim/token')
            .send({ txSignature: 'sig', claimerWallet: 'wallet' })
            .expect(409);
    });
});
