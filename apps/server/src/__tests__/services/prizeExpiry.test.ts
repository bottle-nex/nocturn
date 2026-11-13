import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import PrizeExpiryWorker from '../../../../orchestrator/src/job/prize-expiry.worker.ts';

const mocks = vi.hoisted(() => ({
    process: vi.fn(),
    add: vi.fn(),
    send: vi.fn(),
    sendEmail: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
}));
vi.mock('../../../../orchestrator/node_modules/resend/dist/index.mjs', () => ({
    Resend: class {
        emails = { send: mocks.sendEmail };
    },
}));
vi.mock('bull', () => ({
    default: class {
        process = mocks.process;
        add = mocks.add;
    },
}));
vi.mock('../../../../orchestrator/src/configs/env.ts', () => ({
    Env: { ORCH_REDIS_URL: 'redis://localhost', ORCH_RESEND_KEY: 'test-key' },
}));
vi.mock('../../../../orchestrator/src/services/email/resend.services.ts', () => ({
    default: { send_prize_expired_email: mocks.send },
}));
vi.mock('@nocturn/database', () => ({
    prisma: {
        prizeClaim: {
            updateMany: mocks.updateMany,
            findMany: mocks.findMany,
            update: mocks.update,
        },
    },
}));

let processExpiry: () => Promise<void>;
beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal(
        'fetch',
        vi.fn(() => {
            throw new Error('Unexpected network request in expiry test');
        }),
    );
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.findMany.mockResolvedValue([
        {
            id: 'claim',
            rank: 1,
            amountBaseUnits: BigInt(1000000),
            quiz: { title: 'Quiz', host: { email: 'host@example.com' } },
        },
    ]);
    new PrizeExpiryWorker();
    const registration = mocks.process.mock.calls[0];
    if (!registration) throw new Error('Expiry processor was not registered');
    processExpiry = registration[1];
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('prize expiry notifications', () => {
    it('expires pending prizes and notifies the host before marking delivery', async () => {
        await processExpiry();
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: { status: 'PENDING', expiresAt: { lt: expect.any(Date) } },
            data: { status: 'EXPIRED' },
        });
        expect(mocks.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: 'EXPIRED',
                    expiryNotifiedAt: null,
                    quiz: {
                        escrowPda: { not: null },
                        status: { in: ['COMPLETED', 'PAYOUT_COMPLETED'] },
                    },
                },
            }),
        );
        expect(mocks.send).toHaveBeenCalledWith({
            claimId: 'claim',
            email: 'host@example.com',
            quizTitle: 'Quiz',
            rank: 1,
            amountBaseUnits: BigInt(1000000),
        });
        expect(mocks.update).toHaveBeenCalledWith({
            where: { id: 'claim' },
            data: { expiryNotifiedAt: expect.any(Date) },
        });
    });
    it('does not mark failed emails as delivered', async () => {
        mocks.send.mockRejectedValue(new Error('Email unavailable'));
        await expect(processExpiry()).rejects.toThrow(
            'Failed to notify hosts about expired prizes',
        );
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it('retries notifications for rows expired by an earlier run or another API', async () => {
        mocks.updateMany.mockResolvedValue({ count: 0 });
        await processExpiry();
        expect(mocks.send).toHaveBeenCalledOnce();
    });
    it('notifies other hosts even when one email fails', async () => {
        mocks.findMany.mockResolvedValue([
            {
                id: 'failed',
                rank: 1,
                amountBaseUnits: BigInt(1000000),
                quiz: { title: 'Quiz', host: { email: 'first@example.com' } },
            },
            {
                id: 'delivered',
                rank: 2,
                amountBaseUnits: BigInt(1000000),
                quiz: { title: 'Quiz', host: { email: 'second@example.com' } },
            },
        ]);
        mocks.send.mockRejectedValueOnce(new Error('Email unavailable'));
        await expect(processExpiry()).rejects.toThrow(
            'Failed to notify hosts about expired prizes',
        );
        expect(mocks.send).toHaveBeenCalledTimes(2);
        expect(mocks.update).toHaveBeenCalledWith({
            where: { id: 'delivered' },
            data: { expiryNotifiedAt: expect.any(Date) },
        });
    });
    it('does not email when no unnotified expired claims remain', async () => {
        mocks.findMany.mockResolvedValue([]);
        await processExpiry();
        expect(mocks.send).not.toHaveBeenCalled();
    });
});

describe('host expiry email', () => {
    it('links to the host dashboard and supplies an idempotency key', async () => {
        const { default: emailService } = await vi.importActual<
            typeof import('../../../../orchestrator/src/services/email/resend.services.ts')
        >('../../../../orchestrator/src/services/email/resend.services.ts');
        mocks.sendEmail.mockResolvedValue({ error: null });
        const webUrl = process.env.WEB_URL || process.env.SERVER_WEB_URL || 'http://localhost:3000';
        await emailService.send_prize_expired_email({
            claimId: 'claim',
            email: 'host@example.com',
            quizTitle: 'Quiz',
            rank: 1,
            amountBaseUnits: BigInt(1000000),
        });
        expect(mocks.sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'host@example.com',
                text: expect.stringContaining(`${webUrl}/home`),
            }),
            { idempotencyKey: 'prize-expired/claim' },
        );
    });
    it('propagates provider errors so delivery is retried', async () => {
        const { default: emailService } = await vi.importActual<
            typeof import('../../../../orchestrator/src/services/email/resend.services.ts')
        >('../../../../orchestrator/src/services/email/resend.services.ts');
        mocks.sendEmail.mockResolvedValue({ error: { message: 'Provider unavailable' } });
        await expect(
            emailService.send_prize_expired_email({
                claimId: 'claim',
                email: 'host@example.com',
                quizTitle: 'Quiz',
                rank: 1,
                amountBaseUnits: BigInt(1000000),
            }),
        ).rejects.toThrow('Provider unavailable');
    });
});
