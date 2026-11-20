import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailJobType, type WinnerNotificationEmailData } from '@nocturn/types';
import EmailServiceQueue from '../../services/email/email.services';

const mocks = vi.hoisted(() => ({ add: vi.fn(), ordinaryAdd: vi.fn(), constructor: vi.fn() }));
vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379', SERVER_WEB_URL: 'https://nocturn.app' },
}));

vi.mock('bull', () => ({
    default: class {
        add;
        constructor(name: string, ...args: unknown[]) {
            mocks.constructor(name, ...args);
            this.add = name.endsWith('-winner-notifications') ? mocks.add : mocks.ordinaryAdd;
        }
    },
}));

const data: WinnerNotificationEmailData = {
    email: 'winner@example.com',
    participantName: 'Winner',
    quizTitle: 'Quiz',
    rank: 1,
    prizeAmount: 2.5,
    claimUrl: 'https://nocturn.app/claim?token=token-1',
    expiresAt: '2026-12-01T00:00:00.000Z',
};

let queue: EmailServiceQueue;

describe('EmailServiceQueue winner notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.add.mockResolvedValue({ id: 'job' });
        mocks.ordinaryAdd.mockResolvedValue({ id: 'ordinary-job' });
        queue = new EmailServiceQueue('email-service-queue');
    });

    it('uses a stable identity for each claim and keeps completed and failed identities', async () => {
        await queue.email_winner_notification('claim-1', data);
        await queue.email_winner_notification('claim-1', data);
        await queue.email_winner_notification('claim-2', data);
        expect(mocks.add).toHaveBeenNthCalledWith(
            1,
            { type: EmailJobType.WINNER_NOTIFICATION, data },
            { jobId: 'winner_notification_claim-1', removeOnComplete: false, removeOnFail: false },
        );
        expect(mocks.add.mock.calls[1]).toEqual(mocks.add.mock.calls[0]);
        expect(mocks.add).toHaveBeenNthCalledWith(
            3,
            { type: EmailJobType.WINNER_NOTIFICATION, data },
            { jobId: 'winner_notification_claim-2', removeOnComplete: false, removeOnFail: false },
        );
    });

    it('returns the accepted job and propagates enqueue failures', async () => {
        const job = { id: 'winner_notification_claim-1' };
        mocks.add.mockResolvedValueOnce(job);
        await expect(queue.email_winner_notification('claim-1', data)).resolves.toBe(job);
        const failure = new Error('Queue unavailable');
        mocks.add.mockRejectedValueOnce(failure);
        await expect(queue.email_winner_notification('claim-2', data)).rejects.toThrow(failure);
    });

    it('preserves retry defaults and ordinary email retention and failure handling', async () => {
        expect(mocks.constructor).toHaveBeenCalledWith('email-service-queue', expect.any(String), {
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        });
        expect(mocks.constructor).toHaveBeenCalledWith(
            'email-service-queue-winner-notifications',
            expect.any(String),
            {
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: false,
                    removeOnFail: false,
                },
            },
        );
        const otp = { email: 'user@example.com', otp: '123456' };
        await queue.email_send_otp(otp);
        expect(mocks.ordinaryAdd).toHaveBeenCalledWith({ type: EmailJobType.OTP_EMAIL, data: otp });
        expect(mocks.add).not.toHaveBeenCalled();
        mocks.ordinaryAdd.mockRejectedValueOnce(new Error('Queue unavailable'));
        await expect(queue.email_send_otp(otp)).resolves.toBeUndefined();
    });
});
