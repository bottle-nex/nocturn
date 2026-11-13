import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { prisma } from '@nocturn/database';
import { SigninController } from '../../../controllers/user-controller/signInController';
import { env } from '../../../configs/env';
import { buildRouteApp } from '../../helpers/app.helper';
import { publisherInstance, email_service_queue_instance } from '../../../services/init.services';
import { REQUEST_OTP_SCRIPT, VERIFY_OTP_SCRIPT } from '../../../services/otp.scripts';

vi.mock('../../../services/init.services', () => ({
    publisherInstance: { eval: vi.fn() },
    email_service_queue_instance: { email_send_otp: vi.fn() },
}));

const oauth = buildRouteApp('post', '/sign-in', SigninController.oauth_signin);
const send = buildRouteApp('post', '/send-otp', SigninController.send_otp);
const verify = buildRouteApp('post', '/verify-otp', SigninController.verify_otp);
const user = {
    id: 'user-id',
    email: 'member@example.com',
    name: 'Member',
    image: null,
    isTutorialCompleted: true,
    walletAddress: null,
    isVerified: true,
    isActive: true,
    learningJourneyStep: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    currentTier: 'FREE',
    isTrialing: false,
    trialEndsAt: null,
    subscriptions: [],
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(user);
    vi.mocked(prisma.user.update).mockResolvedValue(user);
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined);
});

function expectNoAuthentication() {
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
}

describe('OAuth sign-in', () => {
    it.each([undefined, 'incorrect', 'x'.repeat(env.AUTH_HANDOFF_SECRET.length)])(
        'rejects an unauthenticated email handoff (%s)',
        async (secret) => {
            const req = request(oauth).post('/sign-in');
            if (secret) req.set('X-Auth-Secret', secret);
            const response = await req.send({ user, account: { provider: 'google' } }).expect(401);
            expect(response.headers['set-cookie']).toBeUndefined();
            expectNoAuthentication();
        },
    );

    it.each([false, true])(
        'accepts an authenticated handoff for an existing user: %s',
        async (exists) => {
            if (exists) vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
            const response = await request(oauth)
                .post('/sign-in')
                .set('X-Auth-Secret', env.AUTH_HANDOFF_SECRET)
                .send({ user })
                .expect(200);
            expect(jwt.verify(response.body.data.token, env.SERVER_JWT_SECRET)).toMatchObject({
                id: user.id,
                email: user.email,
            });
            expect(response.headers['set-cookie']).toBeDefined();
            expect(exists ? prisma.user.update : prisma.user.create).toHaveBeenCalledOnce();
        },
    );

    it('rejects malformed authenticated handoffs', async () => {
        await request(oauth)
            .post('/sign-in')
            .set('X-Auth-Secret', env.AUTH_HANDOFF_SECRET)
            .send({ user: { email: {} } })
            .expect(404);
        expectNoAuthentication();
    });
});

describe('OTP requests', () => {
    it('rejects requests without a body', async () => {
        await request(send).post('/send-otp').expect(400);
        expect(publisherInstance.eval).not.toHaveBeenCalled();
    });
    it('normalizes email and atomically applies limits before sending the code', async () => {
        vi.mocked(publisherInstance.eval).mockResolvedValue(0);
        await request(send).post('/send-otp').send({ email: ' Member@Example.com ' }).expect(200);
        expect(publisherInstance.eval).toHaveBeenCalledWith(
            REQUEST_OTP_SCRIPT,
            4,
            `otp:requests:email:${user.email}`,
            expect.stringMatching(/^otp:requests:ip:/),
            `otp:attempts:${user.email}`,
            `otp:${user.email}`,
            expect.stringMatching(/^\d{6}$/),
        );
        const code = vi.mocked(publisherInstance.eval).mock.calls[0]?.[6];
        expect(email_service_queue_instance.email_send_otp).toHaveBeenCalledWith({
            email: user.email,
            otp: code,
        });
        expect(console.log).not.toHaveBeenCalled();
    });

    it('returns a retry time without sending mail when rate limited or locked', async () => {
        vi.mocked(publisherInstance.eval).mockResolvedValue(900);
        const response = await request(send)
            .post('/send-otp')
            .send({ email: user.email })
            .expect(429);
        expect(response.headers['retry-after']).toBe('900');
        expect(email_service_queue_instance.email_send_otp).not.toHaveBeenCalled();
    });

    it.each([{}, { email: {} }, { email: 'invalid' }])(
        'rejects invalid email: %j',
        async (body) => {
            await request(send).post('/send-otp').send(body).expect(400);
            expect(publisherInstance.eval).not.toHaveBeenCalled();
            expect(email_service_queue_instance.email_send_otp).not.toHaveBeenCalled();
        },
    );

    it('fails closed if Redis is unavailable without logging the code', async () => {
        vi.mocked(publisherInstance.eval).mockRejectedValue(
            new Error('secret code in Redis error'),
        );
        await request(send).post('/send-otp').send({ email: user.email }).expect(500);
        expect(email_service_queue_instance.email_send_otp).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('OTP request failed');
    });

    it('returns an error if email queueing fails without logging the code', async () => {
        vi.mocked(publisherInstance.eval).mockResolvedValue(0);
        vi.mocked(email_service_queue_instance.email_send_otp).mockRejectedValue(
            new Error('secret code in queue error'),
        );
        await request(send).post('/send-otp').send({ email: user.email }).expect(500);
        expect(console.error).toHaveBeenCalledExactlyOnceWith('OTP request failed');
    });
});

describe('OTP verification', () => {
    it('rejects requests without a body', async () => {
        await request(verify).post('/verify-otp').expect(400);
        expectNoAuthentication();
    });
    it.each([0, -1])('rejects invalid, expired, consumed or locked codes (%s)', async (result) => {
        vi.mocked(publisherInstance.eval).mockResolvedValue(result);
        const response = await request(verify)
            .post('/verify-otp')
            .send({ email: user.email, otp: '123456' })
            .expect(result === -1 ? 429 : 400);
        expect(response.headers['set-cookie']).toBeUndefined();
        expectNoAuthentication();
        expect(console.log).not.toHaveBeenCalled();
    });

    it.each([false, true])(
        'issues tokens only after atomic verification for existing user: %s',
        async (exists) => {
            if (exists) vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
            vi.mocked(publisherInstance.eval).mockResolvedValue(1);
            const response = await request(verify)
                .post('/verify-otp')
                .send({ email: ' Member@Example.com ', otp: '123456' })
                .expect(200);
            expect(publisherInstance.eval).toHaveBeenCalledWith(
                VERIFY_OTP_SCRIPT,
                2,
                `otp:${user.email}`,
                `otp:attempts:${user.email}`,
                '123456',
            );
            expect(jwt.verify(response.body.data.token, env.SERVER_JWT_SECRET)).toMatchObject({
                id: user.id,
            });
            expect(response.headers['set-cookie']).toBeDefined();
            expect(console.log).not.toHaveBeenCalled();
        },
    );

    it.each([{ email: user.email, otp: 123456 }, { email: {}, otp: '123456' }, {}])(
        'rejects malformed verification requests: %j',
        async (body) => {
            await request(verify).post('/verify-otp').send(body).expect(400);
            expect(publisherInstance.eval).not.toHaveBeenCalled();
            expectNoAuthentication();
        },
    );

    it('fails closed if atomic verification fails', async () => {
        vi.mocked(publisherInstance.eval).mockRejectedValue(
            new Error('secret code in Redis error'),
        );
        await request(verify)
            .post('/verify-otp')
            .send({ email: user.email, otp: '123456' })
            .expect(500);
        expectNoAuthentication();
        expect(console.error).toHaveBeenCalledWith('OTP verification failed');
    });
});
