import { describe, it, expect, vi, beforeEach } from 'vitest';
import EmailServiceQueue from '../../../services/email/email.services';

const queue = vi.hoisted(() => ({ getJob: vi.fn(), add: vi.fn() }));
vi.mock('../../../configs/env', () => ({ env: { SERVER_REDIS_URL: 'redis://localhost:6379' } }));
vi.mock('bull', () => ({
    default: class {
        constructor() {
            return queue;
        }
    },
}));
const notification = {
    claimId: 'winner-claim',
    email: 'winner@example.com',
    participantName: 'Winner',
    quizTitle: 'Quiz',
    rank: 1,
    prizeAmount: 99,
    claimUrl: 'https://example.com/claim?token=secret',
    expiresAt: '2030-01-01T00:00:00Z',
};

describe('winner notification job recovery', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('retries a retained email job after its automatic attempts are exhausted', async () => {
        const failedJob = {
            attemptsMade: 3,
            isFailed: vi.fn().mockResolvedValueOnce(true).mockResolvedValue(false),
            retry: vi.fn().mockResolvedValue(undefined),
        };
        queue.getJob.mockResolvedValue(failedJob);
        const service = new EmailServiceQueue('email-service-queue');
        await expect(service.email_winner_notification(notification)).resolves.toBe(failedJob);
        await service.email_winner_notification(notification);
        expect(queue.getJob).toHaveBeenCalledWith('winner-winner-claim');
        expect(failedJob.retry).toHaveBeenCalledOnce();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('leaves an active or completed retained job alone to prevent duplicate sends', async () => {
        const retainedJob = { isFailed: vi.fn().mockResolvedValue(false), retry: vi.fn() };
        queue.getJob.mockResolvedValue(retainedJob);
        const service = new EmailServiceQueue('email-service-queue');
        await expect(service.email_winner_notification(notification)).resolves.toBe(retainedJob);
        expect(retainedJob.retry).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('creates missing work with the same retained delivery identity', async () => {
        queue.getJob.mockResolvedValue(null);
        const service = new EmailServiceQueue('email-service-queue');
        await service.email_winner_notification(notification);
        expect(queue.add).toHaveBeenCalledWith(expect.objectContaining({ data: notification }), {
            jobId: 'winner-winner-claim',
            removeOnComplete: false,
            removeOnFail: false,
        });
    });

    it('propagates failure to retry so scheduled recovery can try again', async () => {
        queue.getJob.mockResolvedValue({
            isFailed: vi.fn().mockResolvedValue(true),
            retry: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
        });
        const service = new EmailServiceQueue('email-service-queue');
        await expect(service.email_winner_notification(notification)).rejects.toThrow(
            'Redis unavailable',
        );
        expect(queue.add).not.toHaveBeenCalled();
    });
});
