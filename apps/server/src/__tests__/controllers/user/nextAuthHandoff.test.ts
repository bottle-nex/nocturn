import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from '../../../../../web/node_modules/axios';
import { authOption, type UserType } from '../../../../../web/app/api/auth/[...nextauth]/options';

vi.mock('../../../../../web/node_modules/axios', () => ({ default: { post: vi.fn() } }));
vi.mock('../../../../../web/routes/api_routes', () => ({
    SIGNIN_URL: '/sign-in',
    VERIFY_OTP_URL: '/verify-otp',
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});

describe('NextAuth OAuth handoff', () => {
    it.each(['google', 'github', 'facebook'])('authenticates the %s handoff', async (provider) => {
        vi.stubEnv('AUTH_HANDOFF_SECRET', 'a-dedicated-server-secret-with-32-characters');
        vi.mocked(axios.post).mockResolvedValue({
            data: { success: true, data: { user: { id: 'user-id' }, token: 'access-token' } },
        });
        const user = {
            id: 'provider-id',
            email: 'member@example.com',
            token: undefined,
        } satisfies UserType;
        const result = await authOption.callbacks?.signIn?.({
            user,
            account: { provider, type: 'oauth', providerAccountId: 'provider-id' },
        });
        expect(result).toBe(true);
        expect(axios.post).toHaveBeenCalledWith(
            '/sign-in',
            { user },
            { headers: { 'X-Auth-Secret': process.env.AUTH_HANDOFF_SECRET } },
        );
        expect(user.token).toBe('access-token');
    });

    it.each(['', 'short'])(
        'fails closed when the handoff secret is misconfigured: %s',
        async (secret) => {
            vi.stubEnv('AUTH_HANDOFF_SECRET', secret);
            const result = await authOption.callbacks?.signIn?.({
                user: { id: 'provider-id', email: 'member@example.com' },
                account: { provider: 'google', type: 'oauth', providerAccountId: 'provider-id' },
            });
            expect(result).toBe(false);
            expect(axios.post).not.toHaveBeenCalled();
        },
    );

    it('does not log Axios errors containing the handoff secret', async () => {
        vi.stubEnv('AUTH_HANDOFF_SECRET', 'a-dedicated-server-secret-with-32-characters');
        vi.mocked(axios.post).mockRejectedValue(new Error(process.env.AUTH_HANDOFF_SECRET));
        const result = await authOption.callbacks?.signIn?.({
            user: { id: 'provider-id', email: 'member@example.com' },
            account: { provider: 'google', type: 'oauth', providerAccountId: 'provider-id' },
        });
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledExactlyOnceWith('OAuth sign-in failed');
    });
});
