import { GameSession, Quiz, QuizStatus, prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';
import { env } from '../../configs/env';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { CreateQuizType, QuestionType } from '../../schemas/createQuizSchema';
import { NOCTURN_COOKIE_NAME, SubscriptionEnum, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';
import Subscription from '../../middlewares/subscription.middleware';

const NON_EDITABLE_STATUSES: QuizStatus[] = [
    'LIVE',
    'PUBLISHED',
    'COMPLETED',
    'PAYOUT_PENDING',
    'PAYOUT_COMPLETED',
];

export default class QuizController {

    public static async save(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;
        await QuizController.handle_save(res, quizId, userId, quiz_data, questions || []);
    }

    public static async update(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;
        await QuizController.handle_update(res, quizId, userId, quiz_data, questions || []);
    }

    public static async publish(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;
        await QuizController.handle_publish(res, quizId, userId, quiz_data, questions || []);
    }

    public static async launch(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;
        await QuizController.handle_launch(req, res, quizId, userId, quiz_data, questions || []);
    }

    private static async handle_save(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
    ) {
        try {
            const existing = await QuizController.findQuiz(quizId);

            if (!existing) {
                const quiz = await QuizController.createQuiz(
                    quizId,
                    hostId,
                    quiz_data,
                    questions,
                    QuizStatus.CREATED,
                );
                return ResponseWriter.success(res, { quiz }, 'Quiz saved successfully', 201);
            }

            if (!(await QuizController.validateOwner(res, hostId, quizId))) return;
            if (!QuizController.validateEditable(res, existing.status)) return;

            const quiz = await QuizController.updateQuizData(quizId, quiz_data, questions);
            return ResponseWriter.success(res, { quiz }, 'Quiz updated successfully', 200);
        } catch (error) {
            QuizController.internalError(res, error);
        }
    }

    private static async handle_update(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
    ) {
        try {
            const existing = await QuizController.findQuiz(quizId);

            if (!existing)
                return ResponseWriter.error(
                    res,
                    'QUIZ_NOT_FOUND',
                    'Quiz not found',
                    undefined,
                    404,
                );

            if (!(await QuizController.validateOwner(res, hostId, quizId))) return;
            if (!QuizController.validateEditable(res, existing.status)) return;

            const quiz = await QuizController.updateQuizData(quizId, quiz_data, questions);
            return ResponseWriter.success(res, { quiz }, 'Quiz updated successfully', 200);
        } catch (error) {
            QuizController.internalError(res, error);
        }
    }

    private static async handle_publish(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
    ) {
        try {
            const existing = await QuizController.findQuiz(quizId);

            if (existing?.status === 'LIVE')
                return ResponseWriter.error(
                    res,
                    'QUIZ_ALREADY_LIVE',
                    'Quiz is already live',
                    undefined,
                    400,
                );

            if (existing?.status === 'PUBLISHED')
                return ResponseWriter.error(
                    res,
                    'QUIZ_ALREADY_PUBLISHED',
                    'Quiz is already published',
                    undefined,
                    400,
                );

            if (!existing) {
                const quiz = await QuizController.createQuiz(
                    quizId,
                    hostId,
                    quiz_data,
                    questions,
                    'PUBLISHED',
                );
                return ResponseWriter.success(res, { quiz }, 'Quiz published successfully', 200);
            }

            if (!(await QuizController.validateOwner(res, hostId, quizId))) return;

            const quiz = await QuizController.updateQuizDataWithStatus(
                quizId,
                quiz_data,
                questions,
                'PUBLISHED',
            );
            return ResponseWriter.success(res, { quiz }, 'Quiz published successfully', 200);
        } catch (error) {
            QuizController.internalError(res, error);
        }
    }

    private static async handle_launch(
        req: Request,
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
    ) {
        try {

            const [existing, participantCode, specCode, host, subscription] = await Promise.all([
                QuizController.findQuiz(quizId),
                QuizAction.generateUniqueCode('participant'),
                QuizAction.generateUniqueCode('spectator'),
                QuizController.get_host_details(res, hostId),
                Subscription.get_user_subscription(hostId),
            ]);

            const spectatorCode = subscription === SubscriptionEnum.PRO ? specCode : undefined;

            if (!host) return; // response already sent inside get_host_details

            if (existing?.status === 'LIVE')
                return ResponseWriter.error(
                    res,
                    'QUIZ_ALREADY_LIVE',
                    'Quiz is already live',
                    undefined,
                    400,
                );

            if (existing && existing.hostId !== hostId)
                return ResponseWriter.error(
                    res,
                    'NOT_OWNER',
                    'You are not the owner of this quiz',
                    undefined,
                    403,
                );

            let quiz: Partial<Quiz>;
            let gameSession: Partial<GameSession>;

            if (!existing) {
                ({ quiz, gameSession } = await prisma.$transaction(async (tx) => {
                    const createData: any = {
                        ...quiz_data,
                        id: quizId,
                        hostId,
                        status: 'LIVE',
                        startedAt: new Date(),
                        participantCode,
                        spectatorCode,
                        scheduledAt: quiz_data.scheduledAt
                            ? new Date(quiz_data.scheduledAt)
                            : undefined,
                        questions: { create: questions },
                    };
                    if (!createData.templateId) delete createData.templateId;

                    const created = await tx.quiz.create({
                        data: createData,
                        include: {
                            questions: true,
                            template: true,
                        },
                    });

                    const session = await tx.gameSession.create({
                        data: {
                            quizId: created.id,
                            hostScreen: 'LOBBY',
                            participantScreen: 'LOBBY',
                            questionStartedAt: new Date(),
                            status: 'WAITING',
                        },
                    });

                    return { quiz: created, gameSession: session };
                }));
            } else if (existing.status === 'PUBLISHED') {
                ({ quiz, gameSession } = await prisma.$transaction(async (tx) => {
                    const updated = await tx.quiz.update({
                        where: { id: quizId },
                        data: {
                            status: 'LIVE',
                            startedAt: new Date(),
                            participantCode,
                            spectatorCode,
                        },
                        include: {
                            questions: true,
                            template: true,
                        },
                    });

                    const session = await tx.gameSession.create({
                        data: {
                            quizId,
                            hostScreen: 'LOBBY',
                            participantScreen: 'LOBBY',
                            questionStartedAt: new Date(),
                            status: 'WAITING',
                        },
                    });

                    return { quiz: updated, gameSession: session };
                }));
            } else {
                if (!QuizController.validateEditable(res, existing.status)) return;

                ({ quiz, gameSession } = await prisma.$transaction(async (tx) => {
                    await tx.question.deleteMany({ where: { quizId } });

                    const updated = await tx.quiz.update({
                        where: { id: quizId },
                        data: {
                            ...quiz_data,
                            status: 'LIVE',
                            startedAt: new Date(),
                            participantCode,
                            spectatorCode,
                            scheduledAt: quiz_data.scheduledAt
                                ? new Date(quiz_data.scheduledAt)
                                : undefined,
                            questions: { create: questions },
                        },
                        include: {
                            questions: true,
                            template: true,
                        },
                    });

                    const session = await tx.gameSession.create({
                        data: {
                            quizId,
                            hostScreen: 'LOBBY',
                            participantScreen: 'LOBBY',
                            questionStartedAt: new Date(),
                            status: 'WAITING',
                        },
                    });

                    return { quiz: updated, gameSession: session };
                }));
            }

            // host data now passed into set_host
            redisCacheInstance.set_host(gameSession.id as string, hostId, host);
            redisCacheInstance.set_game_session(gameSession.id as string, gameSession);
            redisCacheInstance.set_quiz(gameSession.id as string, quiz);

            const token = QuizAction.generateLiveGameToken(
                String(hostId),
                quizId,
                gameSession.id!,
                USER_TYPE.HOST,
                req.user?.name,
            );

            res.cookie(NOCTURN_COOKIE_NAME, token, {
                httpOnly: true,
                secure: env.SERVER_NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 1000,
            });

            return ResponseWriter.success(
                res,
                { quiz, gameSession },
                'Quiz launched successfully',
                200,
            );
        } catch (error) {
            QuizController.internalError(res, error);
        }
    }
    // ─── Private: DB Operations ───────────────────────────────────────────────

    private static async findQuiz(quizId: string): Promise<Quiz | null> {
        return prisma.quiz.findUnique({ where: { id: quizId } });
    }

    private static async createQuiz(
        quizId: string,
        hostId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
        status: QuizStatus,
    ): Promise<Quiz> {
        const createData: any = {
            ...quiz_data,
            id: quizId,
            hostId,
            status,
            scheduledAt: quiz_data.scheduledAt ? new Date(quiz_data.scheduledAt) : undefined,
            questions: { create: questions },
        };

        if (!createData.templateId) delete createData.templateId;

        return prisma.quiz.create({ data: createData });
    }

    private static async updateQuizData(
        quizId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
    ): Promise<Partial<Quiz>> {
        return QuizController.updateQuizDataWithStatus(quizId, quiz_data, questions);
    }

    // Single transaction: delete old questions + update quiz fields + optionally set status
    private static async updateQuizDataWithStatus(
        quizId: string,
        quiz_data: Omit<CreateQuizType, 'questions'>,
        questions: QuestionType[],
        status?: QuizStatus,
    ): Promise<Partial<Quiz>> {
        return prisma.$transaction(async (tx) => {
            await tx.question.deleteMany({ where: { quizId } });

            return tx.quiz.update({
                where: { id: quizId },
                data: {
                    ...quiz_data,
                    ...(status && { status }),
                    scheduledAt: quiz_data.scheduledAt
                        ? new Date(quiz_data.scheduledAt)
                        : undefined,
                    questions: { create: questions },
                },
                include: { template: true },
            });
        });
    }

    private static async launchTransaction(
        quizId: string,
    ): Promise<{ quiz: Partial<Quiz>; gameSession: Partial<GameSession> }> {
        const participantCode = await QuizAction.generateUniqueCode('participant');
        const spectatorCode = await QuizAction.generateUniqueCode('spectator');

        return prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.update({
                where: { id: quizId },
                data: { status: 'LIVE', startedAt: new Date(), participantCode, spectatorCode },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    template: true,
                    status: true,
                    questionTimeLimit: true,
                    breakBetweenQuestions: true,
                    eliminationThreshold: true,
                    timeBonus: true,
                    liveChat: true,
                    spectatorMode: true,
                    basePointsPerQuestion: true,
                    pointsMultiplier: true,
                    prizePool: true,
                    currency: true,
                    _count: { select: { questions: true, participants: true } },
                },
            });

            const gameSession = await tx.gameSession.create({
                data: {
                    quizId,
                    hostScreen: 'LOBBY',
                    participantScreen: 'LOBBY',
                    questionStartedAt: new Date(),
                    status: 'WAITING',
                },
                select: {
                    id: true,
                    status: true,
                    hostScreen: true,
                    participantScreen: true,
                    totalParticipants: true,
                    activeParticipants: true,
                    currentQuestionIndex: true,
                },
            });

            return { quiz, gameSession };
        });
    }

    // ─── Private: Validation ──────────────────────────────────────────────────

    private static async validateOwner(res: Response, hostId: string, quizId: string) {
        const isValid = await QuizAction.validOwner(hostId, quizId);
        if (!isValid) {
            ResponseWriter.error(
                res,
                'NOT_OWNER',
                'You are not the owner of this quiz',
                undefined,
                403,
            );
            return false;
        }
        return true;
    }

    private static async get_host_details(res: Response, host_id: string) {
        try {
            const host = await prisma.user.findUnique({
                where: {
                    id: host_id,
                },
            });
            if (!host) {
                ResponseWriter.not_found(res, 'unable to find host data');
                return null;
            }

            return host;
        } catch (error) {
            console.error('error while getting host details in quiz controller: ', error);
            return null;
        }
    }

    private static validateEditable(res: Response, status: QuizStatus) {
        if (NON_EDITABLE_STATUSES.includes(status)) {
            const isLive = status === 'LIVE';
            ResponseWriter.error(
                res,
                isLive ? 'QUIZ_ALREADY_LIVE' : 'QUIZ_ALREADY_PUBLISHED',
                isLive
                    ? 'Quiz is live and cannot be edited'
                    : 'Quiz is published and cannot be edited',
                undefined,
                400,
            );
            return false;
        }
        return true;
    }

    private static internalError(res: Response, error: unknown) {
        console.error('[QuizController]', error);
        ResponseWriter.system_error(res);
    }
}
