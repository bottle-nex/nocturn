import { required } from '../helpers/required';
import { beforeEach, expect, it, vi } from 'vitest';
import ResendService from '../../../../orchestrator/src/services/email/resend.services';
const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('../../../../orchestrator/node_modules/resend', () => ({
    Resend: class {
        emails = { send: mocks.send };
    },
}));
vi.mock('../../../../orchestrator/node_modules/qrcode', () => ({
    default: { toDataURL: async () => 'data:image/png;base64,test' },
}));
vi.mock('../../../../orchestrator/src/configs/env', () => ({ Env: { ORCH_RESEND_KEY: 'test' } }));
const data = {
    email: 'winner@test.com',
    participantName: 'Winner',
    quizTitle: 'Quiz',
    rank: 1,
    prizeAmount: 1,
    claimUrl: 'https://nocturn.app/claim?token=token',
    expiresAt: '2026-12-01',
};
beforeEach(() => {
    vi.resetAllMocks();
    mocks.send.mockResolvedValue({ data: { id: 'email' }, error: null });
});
it('uses a stable provider key so a successful send followed by a worker crash can be retried', async () => {
    await ResendService.send_winner_notification_email(data);
    await ResendService.send_winner_notification_email(data);
    const key = required(mocks.send.mock.calls[0])[1];
    expect(key).toEqual({ idempotencyKey: expect.stringMatching(/^winner-[a-f0-9]{64}$/) });
    expect(required(mocks.send.mock.calls[1])[1]).toEqual(key);
});
it('throws provider errors so Bull does not acknowledge failed delivery', async () => {
    mocks.send.mockResolvedValue({ data: null, error: { message: 'Rate limited' } });
    await expect(ResendService.send_winner_notification_email(data)).rejects.toThrow(
        'Rate limited',
    );
});
