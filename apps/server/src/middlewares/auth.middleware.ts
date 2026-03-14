import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProduction } from '../configs/env';
import { AuthUser } from '../types/express';
import { NOCTURN_REFRESH_COOKIE_NAME } from '@nocturn/types';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!accessToken) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    try {
        // Try the access token first
        const decoded = jwt.verify(accessToken, env.SERVER_JWT_SECRET) as AuthUser;
        req.user = decoded;
        next();
        return;
    } catch {
        // Access token is expired or invalid, try the refresh cookie
    }

    // Fallback: use the refresh token cookie to auto-recover
    const refreshToken = req.cookies?.[NOCTURN_REFRESH_COOKIE_NAME];
    if (!refreshToken) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, env.SERVER_JWT_REFRESH_SECRET) as {
            id: string;
            email: string;
        };

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            env.SERVER_JWT_SECRET,
            { expiresIn: '15m' },
        );

        // Rotate the refresh token
        const newRefreshToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            env.SERVER_JWT_REFRESH_SECRET,
            { expiresIn: '7d' },
        );

        res.cookie(NOCTURN_REFRESH_COOKIE_NAME, newRefreshToken, {
            httpOnly: true,
            secure: isProduction(),
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        // Send the new access token in a response header so the client can update
        res.setHeader('X-Access-Token', newAccessToken);

        req.user = decoded as AuthUser;
        next();
    } catch {
        res.status(401).json({ message: 'Not authorized' });
    }
}
