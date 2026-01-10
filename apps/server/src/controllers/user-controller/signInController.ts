import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';

export default async function signInController(req: Request, res: Response) {
    const { user } = req.body;
    console.log('Sign-in attempt for user:', user);
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        });

        let myUser;
        if (existingUser) {
            myUser = await prisma.user.update({
                where: {
                    email: user.email,
                },
                data: {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            });
        } else {
            myUser = await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            });
        }

        const jwtPayload = {
            name: myUser.name,
            email: myUser.email,
            id: myUser.id,
        };

        const secret = env.SERVER_JWT_SECRET;
        if (!secret) {
            ResponseWriter.system_error(res);
            return;
        }

        const token = jwt.sign(jwtPayload, secret);

        ResponseWriter.success(
            res,
            {
                user: myUser,
                token,
            },
            'Authentication successful',
        );
        return;
    } catch (err) {
        console.error(err);
        ResponseWriter.custom(res, false, 'AUTHENTICATION_FAILED', 'Authentication failed', 500);
        return;
    }
}
