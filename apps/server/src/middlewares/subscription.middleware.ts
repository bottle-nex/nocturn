import { Request, Response, NextFunction } from 'express';
import ResponseWriter from '../class/response_writer';
import { FEATURE, planManager } from '@nocturn/premium';
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

    static async launch_quiz_limit(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;

            if (!user) {
                return ResponseWriter.not_authorized(res);
            }

            const tier =
                (await Subscription.get_user_subscription(user.id)) ?? SubscriptionEnum.FREE;

            const { limit, windowMs } = planManager.getRateLimit(
                tier,
                FEATURE.SESSIONS_PER_DAY
            );

            const total_concurrent_sessions = planManager.getNumericLimit(
                tier,
                FEATURE.MAX_CONCURRENT_SESSIONS
            );

            const window_start = new Date(Date.now() - windowMs);

            const { sessions_today, oldest_session, live_sessions } =
                await prisma.$transaction(async (tx) => {

                    // sessions launched within window
                    const sessions_today = await tx.quiz.count({
                        where: {
                            hostId: user.id,
                            startedAt: {
                                gte: window_start,
                            },
                        },
                    });

                    // oldest session within window
                    const oldest_session = await tx.quiz.findFirst({
                        where: {
                            hostId: user.id,
                            startedAt: {
                                gte: window_start,
                            },
                        },
                        orderBy: {
                            startedAt: "asc",
                        },
                        select: {
                            startedAt: true,
                        },
                    });

                    // currently live sessions
                    const live_sessions = await tx.quiz.count({
                        where: {
                            hostId: user.id,
                            status: "LIVE",
                        },
                    });

                    return {
                        sessions_today,
                        oldest_session,
                        live_sessions,
                    };
                });

            // daily session limit
            if (limit !== null && sessions_today >= limit && oldest_session?.startedAt) {
                console.log('daily sessoin limit');
                const expiresAt =
                    new Date(oldest_session.startedAt).getTime() + windowMs;

                const ttlMs = expiresAt - Date.now();
                const formattedTTL = Subscription.formatTTL(ttlMs);

                res.setHeader("Retry-After", Math.ceil(ttlMs / 1000));

                return ResponseWriter.custom(
                    res,
                    false,
                    "SESSION_LAUNCH_LIMIT_REACHED",
                    `Next launch available in ${formattedTTL}`,
                    403,
                    {
                        title: "Daily limit reached",
                        description: `Next launch available in ${formattedTTL}`,
                    }
                );
            }

            // concurrent sessions limit
            if (
                total_concurrent_sessions !== null &&
                live_sessions >= total_concurrent_sessions
            ) {
                console.log('concurrent sessions limit');
                return ResponseWriter.custom(
                    res,
                    false,
                    "CONCURRENT_SESSION_LIMIT_REACHED",
                    "Wait until a session ends to create more",
                    403,
                    {
                        title: "Concurrent Session limit reached",
                        description: "Wait until a session ends to create more",
                    }
                );
            }

            return next();
        } catch (error) {
            console.error("Error in launch quiz limit:", error);
            return ResponseWriter.system_error(res);
        }
    }

    static async slides_limit(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const questions = req.body?.questions;

            if (!Array.isArray(questions)) {
                next();
                return;
            }

            const tier =
                (await Subscription.get_user_subscription(user.id)) ?? SubscriptionEnum.FREE;
            const ceiling = planManager.getNumericLimit(tier, FEATURE.MAX_SLIDES_PER_PRESENTATION);

            if (ceiling === null) {
                next();
                return;
            }

            if (questions.length > ceiling) {
                ResponseWriter.custom(
                    res,
                    false,
                    'QUESTION_LIMIT_EXCEEDED',
                    `Your plan allows a maximum of ${ceiling} questions per quiz. Upgrade to Pro for unlimited questions.`,
                    403,
                );
                return;
            }

            next();
        } catch (error) {
            console.error('Error in question limit check:', error);
            ResponseWriter.system_error(res);
        }
    }

    static async get_user_subscription(user_id: string): Promise<SubscriptionEnum | null> {
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

            const ceiling = planManager.getNumericLimit(tier, FEATURE.MAX_SPECTATORS_PER_SESSION);

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
                    `The quiz has reached its spectator limit.`,
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
            const ceiling = planManager.getNumericLimit(tier, FEATURE.MAX_PARTICIPANTS_PER_SESSION);
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

    private static formatTTL(ms: number): string {
        if (ms <= 0) return 'a few seconds';

        const totalSeconds = Math.ceil(ms / 1000);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }

        return `${seconds}s`;
    }
}
