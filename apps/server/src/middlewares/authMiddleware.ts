import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const secret = env.SERVER_JWT_SECRET;

    if (!secret) {
        res.status(500).json({ message: 'JWT secret not configured' });
        return;
    }
    if (!token) {
        res.status(500).json({ message: 'Token is not avilable' });
        return;
    }

    try {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            req.user = decoded as AuthUser;
            next();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}
