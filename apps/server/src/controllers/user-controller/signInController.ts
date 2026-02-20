import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import GenerateUser from '../../class/generateUser';
import { publisherInstance, email_service_queue_instance } from '../../services/init.services';
import crypto from 'crypto';

export class SigninController {
    static async oauth_signin(req: Request, res: Response) {
        const { user } = req.body;

        if (!user) {
            ResponseWriter.not_found(res, 'Insufficient data');
            return;
        }
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            let myUser;
            if (existingUser) {
                myUser = await prisma.user.update({
                    where: { email: user.email },
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

            const secret = env.SERVER_JWT_SECRET;
            if (!secret) {
                ResponseWriter.system_error(res);
                return;
            }

            const token = jwt.sign(
                { name: myUser.name, email: myUser.email, id: myUser.id, image: myUser.image },
                secret,
                { expiresIn: '7d' },
            );

            await SigninController.process_collaborator_invitations(myUser.id, myUser.email);

            ResponseWriter.success(res, { user: myUser, token }, 'Authentication successful');
        } catch (err) {
            console.error(err);
            ResponseWriter.custom(
                res,
                false,
                'AUTHENTICATION_FAILED',
                'Authentication failed',
                500,
            );
        }
    }

    static async send_otp(req: Request, res: Response) {
        const { email } = req.body;

        if (!email) {
            ResponseWriter.invalid_data(res, 'Email is required');
            return;
        }

        try {
            const otp = crypto.randomInt(100000, 999999).toString();
            await publisherInstance.set(`otp:${email}`, otp, 'EX', 100);
            await email_service_queue_instance.email_send_otp({ email, otp });

            ResponseWriter.success(res, null, 'OTP sent to your email');
        } catch (err) {
            console.error(err);
            ResponseWriter.system_error(res);
        }
    }

    static async verify_otp(req: Request, res: Response) {
        const { email, otp } = req.body;

        if (!email || !otp) {
            ResponseWriter.invalid_data(res, 'Email and OTP are required');
            return;
        }

        try {
            const stored = await publisherInstance.get(`otp:${email}`);
            if (!stored || stored !== otp) {
                ResponseWriter.invalid_data(res, 'Invalid or expired OTP');
                return;
            }

            await publisherInstance.del(`otp:${email}`);

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            let myUser;
            if (existingUser) {
                myUser = await prisma.user.update({
                    where: { email },
                    data: { isVerified: true },
                });
            } else {
                myUser = await prisma.user.create({
                    data: {
                        name: email.split('@')[0],
                        email,
                        isVerified: true,
                        image: GenerateUser.getRandomAvatar(),
                    },
                });
            }

            const secret = env.SERVER_JWT_SECRET;
            if (!secret) {
                ResponseWriter.system_error(res);
                return;
            }

            const token = jwt.sign(
                { name: myUser.name, email: myUser.email, id: myUser.id, image: myUser.image },
                secret,
            );

            await SigninController.process_collaborator_invitations(myUser.id, myUser.email);

            ResponseWriter.success(res, { user: myUser, token }, 'Authentication successful');
        } catch (err) {
            console.error(err);
            ResponseWriter.custom(
                res,
                false,
                'AUTHENTICATION_FAILED',
                'Authentication failed',
                500,
            );
        }
    }

    private static async process_collaborator_invitations(userId: string, email: string) {
        await prisma.$transaction(async (tx) => {
            const checkForCollaborators = await tx.collaboratorInvitation.findMany({
                where: { email },
            });

            if (checkForCollaborators.length > 0) {
                await tx.collaborator.createMany({
                    data: checkForCollaborators.map((invitation) => ({
                        userId,
                        sessionId: invitation.sessionId,
                        joinedAt: new Date(),
                        color: GenerateUser.getRandomColorsForCollaborators(),
                    })),
                    skipDuplicates: true,
                });
                await tx.collaboratorInvitation.updateMany({
                    where: { email },
                    data: {
                        status: 'ACCEPTED',
                        acceptedAt: new Date(),
                    },
                });
            }
        });
    }
}
