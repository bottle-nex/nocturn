import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmailServiceQueue from '../../services/email/email.services';
import { EmailJobType } from '@nocturn/types';

const { add } = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock('bull', () => ({
    default: vi.fn(function () {
        return { add };
    }),
}));

beforeEach(() => vi.clearAllMocks());

describe('OTP email queue', () => {
    it('queues the OTP for delivery', async () => {
        const queue = new EmailServiceQueue('test-email');
        const data = { email: 'member@example.com', otp: '123456' };
        add.mockResolvedValue({ id: 'job-id' });
        await expect(queue.email_send_otp(data)).resolves.toEqual({ id: 'job-id' });
        expect(add).toHaveBeenCalledWith({ type: EmailJobType.OTP_EMAIL, data });
    });

    it('propagates failures without logging errors containing OTP payloads', async () => {
        const queue = new EmailServiceQueue('test-email');
        const error = new Error('Redis error with OTP payload 123456');
        add.mockRejectedValue(error);
        await expect(
            queue.email_send_otp({ email: 'member@example.com', otp: '123456' }),
        ).rejects.toBe(error);
        expect(console.error).not.toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalled();
    });
});
