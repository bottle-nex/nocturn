import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailJobType, type EmailJob, type WinnerNotificationEmailData } from '@nocturn/types';
import EmailServiceProcessor from '../../../../orchestrator/src/queue/email_service.queue';

const mocks = vi.hoisted(() => ({
    processors: new Map<string, (job: { data: EmailJob }) => Promise<void>>(),
    sendWinner: vi.fn(),
    sendOtp: vi.fn(),
}));

vi.mock('../../../../orchestrator/src/configs/env', () => ({
    Env: { ORCH_REDIS_URL: 'redis://localhost:6379' },
}));
vi.mock('../../../../orchestrator/src/services/email/resend.services', () => ({
    default: {
        send_winner_notification_email: mocks.sendWinner,
        send_otp_email: mocks.sendOtp,
    },
}));
vi.mock('bull', () => ({
    default: class {
        constructor(private name: string) {}
        process(processor: (job: { data: EmailJob }) => Promise<void>) {
            mocks.processors.set(this.name, processor);
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

function processJob(queueName: string, job: EmailJob) {
    const processor = mocks.processors.get(queueName);
    if (!processor) throw new Error(`No processor registered for ${queueName}`);
    return processor({ data: job });
}

describe('EmailServiceProcessor winner queue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.processors.clear();
        mocks.sendWinner.mockResolvedValue(undefined);
        mocks.sendOtp.mockResolvedValue(undefined);
        new EmailServiceProcessor('email-service-queue');
    });

    it.each(['email-service-queue', 'email-service-queue-winner-notifications'])(
        'delivers winner notifications from %s',
        async (queueName) => {
            await processJob(queueName, { type: EmailJobType.WINNER_NOTIFICATION, data });
            expect(mocks.sendWinner).toHaveBeenCalledExactlyOnceWith(data);
        },
    );

    it('still handles ordinary email jobs on the original queue', async () => {
        const otp = { email: 'user@example.com', otp: '123456' };
        await processJob('email-service-queue', { type: EmailJobType.OTP_EMAIL, data: otp });
        expect(mocks.sendOtp).toHaveBeenCalledExactlyOnceWith(otp);
        expect(mocks.sendWinner).not.toHaveBeenCalled();
    });

    it('propagates winner delivery failures for Bull to retry', async () => {
        mocks.sendWinner.mockRejectedValueOnce(new Error('Delivery failed'));
        await expect(
            processJob('email-service-queue-winner-notifications', {
                type: EmailJobType.WINNER_NOTIFICATION,
                data,
            }),
        ).rejects.toThrow('Delivery failed');
    });
});
