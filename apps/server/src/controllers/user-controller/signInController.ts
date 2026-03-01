import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env, isProduction } from '../../configs/env';
import { prisma } from '@nocturn/database';
import ResponseWriter from '../../class/response_writer';
import GenerateUser from '../../class/generateUser';
import { publisherInstance, email_service_queue_instance } from '../../services/init.services';
import crypto from 'crypto';
import { NOCTURN_REFRESH_COOKIE_NAME, SubscriptionEnum } from '@nocturn/types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export class SigninController {
    private static generateTokens(user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        subscription: SubscriptionEnum;
    }) {
        const accessToken = jwt.sign(
            {
                name: user.name,
                email: user.email,
                id: user.id,
                image: user.image,
                subscription: user.subscription
            },
            env.SERVER_JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY },
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            env.SERVER_JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY },
        );

        return { accessToken, refreshToken };
    }

    private static setRefreshCookie(res: Response, refreshToken: string) {
        res.cookie(NOCTURN_REFRESH_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: isProduction(),
            sameSite: 'strict',
            maxAge: REFRESH_COOKIE_MAX_AGE,
            path: '/',
        });
    }

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
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        subscriptions: {
                            select: {
                                tier: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                });
            } else {
                myUser = await prisma.user.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        subscriptions: {
                            select: {
                                tier: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                });
            }

            const subscription = (myUser?.subscriptions[0]?.tier.name as SubscriptionEnum) ?? SubscriptionEnum.FREE;

            const { accessToken, refreshToken } = SigninController.generateTokens({
                ...myUser,
                subscription,
            });
            SigninController.setRefreshCookie(res, refreshToken);

            await SigninController.process_collaborator_invitations(myUser.id, myUser.email);

            ResponseWriter.success(
                res,
                { user: { ...myUser, subscription }, token: accessToken },
                'Authentication successful',
            );
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
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        subscriptions: {
                            select: {
                                tier: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                });
            } else {
                myUser = await prisma.user.create({
                    data: {
                        name: email.split('@')[0],
                        email,
                        isVerified: true,
                        image: GenerateUser.getRandomAvatar(),
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        subscriptions: {
                            select: {
                                tier: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                });
            }

            const subscription = (myUser?.subscriptions[0]?.tier.name as SubscriptionEnum) ?? SubscriptionEnum.FREE;

            const { accessToken, refreshToken } = SigninController.generateTokens({
                ...myUser,
                subscription,
            });
            SigninController.setRefreshCookie(res, refreshToken);

            await SigninController.process_collaborator_invitations(myUser.id, myUser.email);

            ResponseWriter.success(
                res,
                { user: { ...myUser, subscription }, token: accessToken },
                'Authentication successful',
            );
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
