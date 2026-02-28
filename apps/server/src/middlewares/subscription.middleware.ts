import { Request, Response, NextFunction } from 'express';
import ResponseWriter from '../class/response_writer';
import { planManager } from '@nocturn/premium';
import { SubscriptionEnum } from '@nocturn/types';
import { prisma } from '@nocturn/database';

export default class Subscription {
    static async spectator_limit_via_code(req: Request, res: Response, next: NextFunction) {
        const code = req.body?.code as string | undefined;

        if (!code) {
            ResponseWriter.invalid_data(res);
            return;
        }

        const quiz = await Subscription.get_quiz_by_spectator_code(code);
        await Subscription.check_spectator_limit(quiz, res, next);
    }

    static async spectator_limit_via_url(req: Request, res: Response, next: NextFunction) {
        const quizId = req.query?.quizId as string | undefined;

        if (!quizId) {
            ResponseWriter.invalid_data(res);
            return;
        }

        const quiz = await Subscription.get_quiz_by_id(quizId);
        await Subscription.check_spectator_limit(quiz, res, next);
    }

    static async participant_limit_via_code(req: Request, res: Response, next: NextFunction) {
        const code = req.body?.code as string | undefined;
        if (!code) {
            ResponseWriter.invalid_data(res);
            return;
        }
        const quiz = await Subscription.get_quiz_by_participant_code(code);
        await Subscription.check_participant_limit(quiz, res, next);
    }

    private static async check_spectator_limit(
        quiz: { id: string; hostId: string } | null,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (!quiz) {
                ResponseWriter.not_found(res, 'Invalid quiz. Please check and try again.');
                return;
            }

            const owner_tier = await Subscription.get_user_subscription(quiz.hostId);
            const tier = owner_tier ?? SubscriptionEnum.FREE;

            const ceiling = planManager.getNumericLimit(tier, 'maxSpectatorPerSession');

            if (ceiling === null) {
                next();
                return;
            }

            const current_count = await prisma.spectator.count({
                where: { quizId: quiz.id },
            });

            if (current_count >= ceiling) {
                ResponseWriter.custom(
                    res,
                    false,
                    'SPECTATOR_LIMIT_REACHED',
                    `This quiz has reached its spectator limit of ${ceiling}.`,
                    403,
                );
                return;
            }

            next();
        } catch (error) {
            console.error('Error in spectator limit check:', error);
            ResponseWriter.system_error(res);
        }
    }

    private static async check_participant_limit(
        quiz: { id: string; hostId: string } | null,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (!quiz) {
                ResponseWriter.not_found(res, 'Invalid quiz. Please check and try again.');
                return;
            }
            const owner_tier = await Subscription.get_user_subscription(quiz.hostId);
            const tier = owner_tier ?? SubscriptionEnum.FREE;
            const ceiling = planManager.getNumericLimit(tier, 'maxParticipantPerSession');
            if (ceiling === null) {
                next();
                return;
            }
            const current_count = await prisma.participant.count({
                where: { quizId: quiz.id },
            });
            if (current_count >= ceiling) {
                ResponseWriter.custom(
                    res,
                    false,
                    'PARTICIPANT_LIMIT_REACHED',
                    `This quiz has reached its participant limit of ${ceiling}.`,
                    402,
                );
                return;
            }
            next();
        } catch (error) {
            console.error('Error in participant limit check:', error);
            ResponseWriter.system_error(res);
        }
    }

    private static async get_quiz_by_spectator_code(code: string) {
        return prisma.quiz.findUnique({
            where: { spectatorCode: code },
            select: { id: true, hostId: true },
        });
    }

    private static async get_quiz_by_participant_code(code: string) {
        return prisma.quiz.findUnique({
            where: { participantCode: code },
            select: { id: true, hostId: true },
        });
    }

    private static async get_quiz_by_id(quizId: string) {
        return prisma.quiz.findUnique({
            where: { id: quizId },
            select: { id: true, hostId: true },
        });
    }

    private static async get_user_subscription(user_id: string): Promise<SubscriptionEnum | null> {
        try {
            const userData = await prisma.user.findUnique({
                where: { id: user_id },
                select: {
                    subscriptions: {
                        select: { tier: { select: { name: true } } },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            });

            if (!userData || userData.subscriptions.length === 0) return null;

            return userData.subscriptions[0].tier.name as SubscriptionEnum;
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
    }
}
