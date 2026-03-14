import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProduction } from '../../configs/env';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import { NOCTURN_REFRESH_COOKIE_NAME } from '@nocturn/types';

const ACCESS_TOKEN_EXPIRY = '1m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export class RefreshTokenController {
    static async refreshToken(req: Request, res: Response) {
        const token = req.cookies?.[NOCTURN_REFRESH_COOKIE_NAME];

        if (!token) {
            res.status(401).json({ message: 'No refresh token provided' });
            return;
        }

        try {
            const decoded = jwt.verify(token, env.SERVER_JWT_REFRESH_SECRET) as {
                id: string;
                email: string;
            };

            // Ensure the user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (!user) {
                res.clearCookie(NOCTURN_REFRESH_COOKIE_NAME, { path: '/' });
                res.status(401).json({ message: 'User not found' });
                return;
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { name: user.name, email: user.email, id: user.id, image: user.image },
                env.SERVER_JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIRY },
            );

            // Rotate refresh token
            const newRefreshToken = jwt.sign(
                { id: user.id, email: user.email },
                env.SERVER_JWT_REFRESH_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY },
            );

            res.cookie(NOCTURN_REFRESH_COOKIE_NAME, newRefreshToken, {
                httpOnly: true,
                secure: isProduction(),
                sameSite: 'strict',
                maxAge: REFRESH_COOKIE_MAX_AGE,
                path: '/',
            });

            ResponseWriter.success(res, { token: accessToken }, 'Token refreshed successfully');
        } catch (error) {
            // Token expired or invalid — clear the cookie
            console.error('error in refreshing the token: ', error);
            res.clearCookie(NOCTURN_REFRESH_COOKIE_NAME, { path: '/' });
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }

    static async initRefresh(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user?.id || !user?.email) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const refreshToken = jwt.sign(
                { id: user.id, email: user.email },
                env.SERVER_JWT_REFRESH_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY },
            );

            res.cookie(NOCTURN_REFRESH_COOKIE_NAME, refreshToken, {
                httpOnly: true,
                secure: isProduction(),
                sameSite: 'strict',
                maxAge: REFRESH_COOKIE_MAX_AGE,
                path: '/',
            });

            ResponseWriter.success(res, null, 'Refresh cookie set successfully');
        } catch {
            res.status(500).json({ message: 'Failed to initialize refresh session' });
        }
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie(NOCTURN_REFRESH_COOKIE_NAME, {
            httpOnly: true,
            secure: isProduction(),
            sameSite: 'strict',
            path: '/',
        });

        ResponseWriter.success(res, null, 'Logged out successfully');
    }
}
