import { GameSession, Quiz, QuizStatus, prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';
import { env } from '../../configs/env';
import { createQuizSchema } from '../../schemas/createQuizSchema';
import { CreateQuizType, QuestionType } from '../../schemas/createQuizSchema';
import { NOCTURN_COOKIE_NAME, USER_TYPE } from '@nocturn/types';
import { redisCacheInstance } from '../../services/init.services';

const NON_EDITABLE_STATUSES: QuizStatus[] = ['LIVE', 'PUBLISHED'];

export default class NewQuizController {

    // ───────────────────────── PUBLIC ROUTE HANDLERS ─────────────────────────

    public static async save(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;

        await NewQuizController.handle_save(
            res,
            quizId,
            userId,
            { ...quiz_data, questions: questions || [] },
            questions || []
        );
    }

    public static async update(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;

        await NewQuizController.handle_update(
            res,
            quizId,
            userId,
            { ...quiz_data, questions: questions || [] },
            questions || []
        );
    }

    public static async publish(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;

        await NewQuizController.handle_publish(
            res,
            quizId,
            userId,
            { ...quiz_data, questions: questions || [] },
            questions || []
        );
    }

    public static async launch(req: Request, res: Response) {
        const userId = req.user?.id;
        const quizId = req.params.quizId;

        if (!userId) return ResponseWriter.not_authorized(res, 'User authentication required');
        if (!quizId) return ResponseWriter.invalid_data(res, 'Quiz ID is required');

        const parsed = createQuizSchema.safeParse(req.body);
        if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid quiz format');

        const { questions, ...quiz_data } = parsed.data;

        await NewQuizController.handle_launch(
            req,
            res,
            quizId,
            userId,
            { ...quiz_data, questions: questions || [] },
            questions || []
        );
    }

    // ───────────────────────── CORE LOGIC ─────────────────────────

    private static async handle_save(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ) {
        try {
            const existing = await NewQuizController.findQuiz(quizId);

            if (!existing) {
                const quiz = await NewQuizController.createQuiz(quizId, hostId, quiz_data, questions);
                return ResponseWriter.success(res, { quiz }, 'Quiz saved successfully', 201);
            }

            if (!(await NewQuizController.validateOwner(res, hostId, quizId))) return;
            if (!NewQuizController.validateEditable(res, existing.status)) return;

            const quiz = await NewQuizController.updateQuizData(quizId, quiz_data, questions);
            return ResponseWriter.success(res, { quiz }, 'Quiz updated successfully', 200);

        } catch (error) {
            NewQuizController.internalError(res, error);
        }
    }

    private static async handle_update(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ) {
        try {
            const existing = await NewQuizController.findQuiz(quizId);

            if (!existing)
                return ResponseWriter.error(res, 'QUIZ_NOT_FOUND', 'Quiz not found', undefined, 404);

            if (!(await NewQuizController.validateOwner(res, hostId, quizId))) return;
            if (!NewQuizController.validateEditable(res, existing.status)) return;

            const quiz = await NewQuizController.updateQuizData(quizId, quiz_data, questions);
            return ResponseWriter.success(res, { quiz }, 'Quiz updated successfully', 200);

        } catch (error) {
            NewQuizController.internalError(res, error);
        }
    }

    private static async handle_publish(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ) {
        try {
            const existing = await NewQuizController.findQuiz(quizId);

            if (existing?.status === 'LIVE')
                return ResponseWriter.error(res, 'QUIZ_ALREADY_LIVE', 'Quiz is already live', undefined, 400);

            if (existing?.status === 'PUBLISHED')
                return ResponseWriter.error(res, 'QUIZ_ALREADY_PUBLISHED', 'Quiz is already published', undefined, 400);

            let targetQuizId = quizId;

            if (existing) {
                if (!(await NewQuizController.validateOwner(res, hostId, quizId))) return;
                await NewQuizController.updateQuizData(quizId, quiz_data, questions);
            } else {
                const created = await NewQuizController.createQuiz(quizId, hostId, quiz_data, questions);
                targetQuizId = created.id;
            }

            const quiz = await prisma.quiz.update({
                where: { id: targetQuizId },
                data: { status: 'PUBLISHED' },
            });

            return ResponseWriter.success(res, { quiz }, 'Quiz published successfully', 200);

        } catch (error) {
            NewQuizController.internalError(res, error);
        }
    }

    private static async handle_launch(
        req: Request,
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ) {
        try {
            const existing = await NewQuizController.findQuiz(quizId);

            if (existing?.status === 'LIVE')
                return ResponseWriter.error(res, 'QUIZ_ALREADY_LIVE', 'Quiz is already live', undefined, 400);

            let targetQuizId = quizId;

            if (existing?.status === 'PUBLISHED') {
                if (!(await NewQuizController.validateOwner(res, hostId, quizId))) return;
            } else {
                const id = await NewQuizController.publishQuizData(res, quizId, hostId, quiz_data, questions);
                if (!id) return;
                targetQuizId = id;
            }

            const { quiz, gameSession } = await NewQuizController.launchTransaction(targetQuizId);

            redisCacheInstance.set_host(gameSession.id!, hostId, {});

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

            return ResponseWriter.success(res, { quiz, gameSession }, 'Quiz launched successfully', 200);

        } catch (error) {
            NewQuizController.internalError(res, error);
        }
    }

    // ───────────────────────── DATABASE ─────────────────────────

    private static async findQuiz(quizId: string): Promise<Quiz | null> {
        return prisma.quiz.findUnique({ where: { id: quizId } });
    }

    private static async createQuiz(
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ): Promise<Quiz> {

        const createData: any = {
            ...quiz_data,
            id: quizId,
            hostId,
            scheduledAt: quiz_data.scheduledAt ? new Date(quiz_data.scheduledAt) : undefined,
            questions: { create: questions },
        };

        if (!createData.templateId) delete createData.templateId;

        return prisma.quiz.create({ data: createData });
    }

    private static async updateQuizData(
        quizId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ): Promise<Partial<Quiz>> {

        return prisma.$transaction(async (tx) => {

            await tx.question.deleteMany({ where: { quizId } });

            return tx.quiz.update({
                where: { id: quizId },
                data: {
                    ...quiz_data,
                    scheduledAt: quiz_data.scheduledAt ? new Date(quiz_data.scheduledAt) : undefined,
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
            });

            const gameSession = await tx.gameSession.create({
                data: {
                    quizId,
                    hostScreen: 'LOBBY',
                    participantScreen: 'LOBBY',
                    questionStartedAt: new Date(),
                    status: 'WAITING',
                },
            });

            return { quiz, gameSession };
        });
    }

    private static async publishQuizData(
        res: Response,
        quizId: string,
        hostId: string,
        quiz_data: CreateQuizType,
        questions: QuestionType[],
    ): Promise<string | null> {

        const existing = await NewQuizController.findQuiz(quizId);

        if (existing?.status === 'LIVE')
            return ResponseWriter.error(res, 'QUIZ_ALREADY_LIVE', 'Quiz is already live', undefined, 400), null;

        if (existing?.status === 'PUBLISHED')
            return ResponseWriter.error(res, 'QUIZ_ALREADY_PUBLISHED', 'Quiz is already published', undefined, 400), null;

        let targetQuizId = quizId;

        if (existing) {
            if (!(await NewQuizController.validateOwner(res, hostId, quizId))) return null;
            await NewQuizController.updateQuizData(quizId, quiz_data, questions);
        } else {
            const created = await NewQuizController.createQuiz(quizId, hostId, quiz_data, questions);
            targetQuizId = created.id;
        }

        await prisma.quiz.update({
            where: { id: targetQuizId },
            data: { status: 'PUBLISHED' },
        });

        return targetQuizId;
    }

    // ───────────────────────── VALIDATION ─────────────────────────

    private static async validateOwner(res: Response, hostId: string, quizId: string) {
        const isValid = await QuizAction.validOwner(hostId, quizId);
        if (!isValid) {
            ResponseWriter.error(res, 'NOT_OWNER', 'You are not the owner of this quiz', undefined, 403);
            return false;
        }
        return true;
    }

    private static validateEditable(res: Response, status: QuizStatus) {
        if (NON_EDITABLE_STATUSES.includes(status)) {
            const isLive = status === 'LIVE';
            ResponseWriter.error(
                res,
                isLive ? 'QUIZ_ALREADY_LIVE' : 'QUIZ_ALREADY_PUBLISHED',
                isLive ? 'Quiz is live and cannot be edited' : 'Quiz is published and cannot be edited',
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