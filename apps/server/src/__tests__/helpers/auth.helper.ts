import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// These values MUST exactly match .env.test.
// The real authMiddleware verifies tokens against env.SERVER_JWT_SECRET, so
// using the same secret here means we test the actual JWT verification path
// without mocking the middleware itself.
// ---------------------------------------------------------------------------
const TEST_JWT_SECRET = 'test-jwt-secret-that-is-32-chars-long!';
const TEST_JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-32-chars!';

export interface TestUser {
    id: string;
    email: string;
    name: string;
    image: string | null;
}

/** Stable default user fixture. Reuse across tests for consistency. */
export const TEST_USER: TestUser = {
    id: 'test-user-id-123',
    email: 'test@nocturn.app',
    name: 'Test User',
    image: null,
};

/**
 * Generates a valid, short-lived access token for the given user.
 *
 * Usage in Supertest:
 *   request(app).post('/...').set('Authorization', bearerHeader())
 */
export function generateAccessToken(user: Partial<TestUser> = {}): string {
    const payload = { ...TEST_USER, ...user };
    return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Generates a valid refresh token.
 * Used when testing the cookie-based fallback path in authMiddleware.
 */
export function generateRefreshToken(user: Partial<Pick<TestUser, 'id' | 'email'>> = {}): string {
    const payload = {
        id: user.id ?? TEST_USER.id,
        email: user.email ?? TEST_USER.email,
    };
    return jwt.sign(payload, TEST_JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Generates an already-expired access token.
 * Used to trigger the refresh-token fallback path in authMiddleware.
 */
export function generateExpiredAccessToken(user: Partial<TestUser> = {}): string {
    const payload = { ...TEST_USER, ...user };
    return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '-1s' });
}

/**
 * Returns a fully-formed Authorization header value (with the Bearer prefix).
 * Convenience wrapper for supertest .set() calls.
 */
export function bearerHeader(user: Partial<TestUser> = {}): string {
    return `Bearer ${generateAccessToken(user)}`;
}
