import { beforeEach, expect, it, vi } from 'vitest';
import EmailServiceQueue from '../../services/email/email.services';
vi.mock('../../configs/env', () => ({
    env: { SERVER_REDIS_URL: 'redis://localhost:6379', SERVER_WEB_URL: 'http://localhost' },
}));
const mocks = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock('bull', () => ({
    default: class {
        add = mocks.add;
    },
}));
beforeEach(() => vi.resetAllMocks());
const data = {
    email: 'winner@test.com',
    participantName: 'Winner',
    quizTitle: 'Quiz',
    rank: 1,
    prizeAmount: 1,
    claimUrl: 'http://localhost/claim?token=token',
    expiresAt: '2026-12-01',
};
it('retains a stable winner job across enqueue retries', async () => {
    const queue = new EmailServiceQueue('test');
    await queue.email_winner_notification(data, 'claim-id');
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ data }), {
        jobId: 'winner-claim-id',
        removeOnComplete: false,
        removeOnFail: false,
    });
});
it('propagates enqueue errors so finalization can retry', async () => {
    mocks.add.mockRejectedValue(new Error('Redis unavailable'));
    await expect(
        new EmailServiceQueue('test').email_winner_notification(data, 'claim-id'),
    ).rejects.toThrow('Redis unavailable');
});
