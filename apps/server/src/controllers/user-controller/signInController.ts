import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import GenerateUser from '../../class/generateUser';

export default async function signInController(req: Request, res: Response) {
    const { user } = req.body;

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

        await prisma.$transaction(async (tx) => {
            const checkForCollaborators = await tx.collaboratorInvitation.findMany({
                where: {
                    email: myUser.email,
                },
            });

            if (checkForCollaborators.length > 0) {
                await tx.collaborator.createMany({
                    data: checkForCollaborators.map((invitiation) => {
                        return {
                            userId: myUser.id,
                            sessionId: invitiation.sessionId,
                            joinedAt: new Date(),
                            color: GenerateUser.getRandomColorsForCollaborators(),
                        };
                    }),
                    skipDuplicates: true,
                });
                await tx.collaboratorInvitation.updateMany({
                    where: {
                        email: myUser.email,
                    },
                    data: {
                        status: 'ACCEPTED',
                        acceptedAt: new Date(),
                    },
                });
            }
        });

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
