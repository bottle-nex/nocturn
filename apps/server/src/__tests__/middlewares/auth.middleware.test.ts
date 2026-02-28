import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
    generateAccessToken,
    generateExpiredAccessToken,
    generateRefreshToken,
    TEST_USER,
} from '../helpers/auth.helper.ts';
import { buildRouteApp } from '../helpers/app.helper.ts';
import authMiddleware from '../../middlewares/auth.middleware.ts';
import { NOCTURN_REFRESH_COOKIE_NAME } from '@nocturn/types';
import type { Request, Response } from 'express';

// ---------------------------------------------------------------------------
// A stub handler that runs AFTER authMiddleware succeeds.
// Returns req.user so tests can assert on what the middleware attached.
// ---------------------------------------------------------------------------
const protectedHandler = vi.fn((req: Request, res: Response) => {
    res.status(200).json({ user: req.user });
});

// One isolated Express app for all tests in this file.
const app = buildRouteApp('get', '/protected', authMiddleware, protectedHandler);

describe('authMiddleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // Happy path — valid access token
    // -----------------------------------------------------------------------
    it('should call next() and attach req.user when a valid Bearer token is provided', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .expect(200);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.id).toBe(TEST_USER.id);
        expect(response.body.user.email).toBe(TEST_USER.email);
        expect(protectedHandler).toHaveBeenCalledOnce();
    });

    // -----------------------------------------------------------------------
    // No Authorization header
    // -----------------------------------------------------------------------
    it('should return 401 with correct message when no Authorization header is present', async () => {
        const response = await request(app).get('/protected').expect(401);

        expect(response.body.message).toBe('Unauthorized: No token provided');
        expect(protectedHandler).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Authorization header present but missing the "Bearer " prefix
    // -----------------------------------------------------------------------
    it('should return 401 when Authorization header does not start with "Bearer "', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Token some-token-value')
            .expect(401);

        expect(response.body.message).toBe('Unauthorized: No token provided');
        expect(protectedHandler).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Garbage token (not a JWT at all)
    // -----------------------------------------------------------------------
    it('should return 401 when the Bearer token is not a valid JWT', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer not.a.real.token')
            .expect(401);

        // No refresh cookie present → falls through to the final 401
        expect(response.body.message).toBe('Not authorized');
        expect(protectedHandler).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Token signed with a different secret
    // -----------------------------------------------------------------------
    it('should return 401 when the Bearer token was signed with a wrong secret', async () => {
        const wrongSecretToken = jwt.sign(
            { id: TEST_USER.id, email: TEST_USER.email },
            'completely-wrong-secret-that-is-long-enough!!',
            { expiresIn: '1h' },
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${wrongSecretToken}`)
            .expect(401);

        expect(response.body.message).toBe('Not authorized');
        expect(protectedHandler).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Expired access token, no refresh cookie → 401
    // -----------------------------------------------------------------------
    it('should return 401 when access token is expired and no refresh cookie is present', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${generateExpiredAccessToken()}`)
            .expect(401);

        expect(response.body.message).toBe('Not authorized');
        expect(protectedHandler).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------
    // Expired access token + valid refresh cookie → auto-recovery
    // Middleware should issue a new access token and rotate the refresh cookie
    // -----------------------------------------------------------------------
    it('should recover and call next() when access token is expired but refresh cookie is valid', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${generateExpiredAccessToken()}`)
            .set('Cookie', `${NOCTURN_REFRESH_COOKIE_NAME}=${generateRefreshToken()}`)
            .expect(200);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.id).toBe(TEST_USER.id);

        // authMiddleware must have issued a new access token via the response header
        expect(response.headers['x-access-token']).toBeDefined();

        // A rotated refresh token must be set via Set-Cookie
        const setCookieHeader = response.headers['set-cookie'] as string[] | string | undefined;
        const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ''];
        expect(cookies.some((c) => c.startsWith(NOCTURN_REFRESH_COOKIE_NAME))).toBe(true);

        expect(protectedHandler).toHaveBeenCalledOnce();
    });

    // -----------------------------------------------------------------------
    // Expired access token + expired refresh cookie → 401
    // -----------------------------------------------------------------------
    it('should return 401 when both access token and refresh cookie are expired', async () => {
        const expiredRefreshToken = jwt.sign(
            { id: TEST_USER.id, email: TEST_USER.email },
            'test-refresh-secret-that-is-32-chars!',
            { expiresIn: '-1s' },
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${generateExpiredAccessToken()}`)
            .set('Cookie', `${NOCTURN_REFRESH_COOKIE_NAME}=${expiredRefreshToken}`)
            .expect(401);

        expect(response.body.message).toBe('Not authorized');
        expect(protectedHandler).not.toHaveBeenCalled();
    });
});
