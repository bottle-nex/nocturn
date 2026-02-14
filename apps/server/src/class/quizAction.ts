import { HostScreen, prisma } from '@nocturn/database';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';
import {
    CollabRole,
    CollabSessionTokenPayload,
    CookiePayload,
    LiveGameTokenPayload,
    USER_TYPE,
} from '@nocturn/types';
import { env } from '../configs/env';
import { QuestionType } from '../schemas/createQuizSchema';

export default class QuizAction {
    private static generateSpectatorCode = customAlphabet(
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        6,
    );

    private static generateParticipantCode = customAlphabet(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        12,
    );

    public static async generateUniqueCode(type: 'participant' | 'spectator'): Promise<string> {
        while (true) {
            const code =
                type === 'participant'
                    ? QuizAction.generateParticipantCode()
                    : QuizAction.generateSpectatorCode();

            const quiz = await prisma.quiz.findFirst({
                where: type === 'participant' ? { participantCode: code } : { spectatorCode: code },
                select: { id: true },
            });

            if (!quiz) return code;
        }
    }

    static async restoreQuiz(quizId: string) {
        await prisma.quiz.updateMany({
            where: {
                id: quizId,
                isDeleted: true,
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });
    }

    static async permanentDeleteQuiz(quizId: string, userId: string) {
        if (!quizId || !userId) {
            console.error('Insufficient creds');
            return;
        }
        try {
            await prisma.quiz.delete({
                where: {
                    id: quizId,
                    hostId: userId,
                },
            });
        } catch (error) {
            console.error('Error in permanently deleting quiz: ', error);
            return;
        }
    }

    static async moveToTrash(quizId: string, userId: string) {
        if (!quizId || !userId) {
            console.error('Insufficient credentials');
            return;
        }

        try {
            const result = await prisma.quiz.updateMany({
                where: {
                    id: quizId,
                    isDeleted: false,
                    hostId: userId,
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            });

            if (result.count === 0) {
                throw new Error('UNAUTHORIZED_OR_ALREADY_DELETED');
            }
        } catch (error) {
            console.error('Error in deleting quiz', error);
            return;
        }
    }

    static async validOwner(hostId: string, quizId: string): Promise<boolean> {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: hostId,
            },
        });
        if (!quiz) {
            return false;
        }
        return true;
    }

    public static generateTokenId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // public static generateUserToken(
    //     userId: string,
    //     quizId: string,
    //     gameSessionId: string,
    //     role: USER_TYPE | undefined,
    //     name: string,
    //     collabRole?: CollabRole,
    //     collabSessionId?: string,
    // ): string {
    //     const tokenId = QuizAction.generateTokenId();
    //     const payload: CookiePayload = {
    //         userId,
    //         quizId,
    //         gameSessionId,
    //         role,
    //         name,
    //         collabRole,
    //         collabSessionId,
    //         tokenId,
    //         iat: Math.floor(Date.now() / 1000),
    //         exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    //     };

    //     return jwt.sign(payload, env.SERVER_JWT_SECRET);
    // }

    public static generateCollabSessionToken(
        userId: string,
        quizId: string,
        role: CollabRole,
        name: string,
        color: string,
        collabSessionId: string,
    ): string {
        const tokenId = QuizAction.generateTokenId();
        const payload: CollabSessionTokenPayload = {
            userId,
            quizId,
            role,
            color,
            name,
            collabSessionId,
            tokenId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };
        return jwt.sign(payload, env.SERVER_JWT_SECRET);
    }

    public static generateLiveGameToken(
        userId: string,
        quizId: string,
        gameSessionId: string,
        role: USER_TYPE | undefined,
        name: string,
    ) {
        const tokenId = QuizAction.generateTokenId();
        const payload: LiveGameTokenPayload = {
            userId,
            quizId,
            gameSessionId,
            role,
            name,
            tokenId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };

        return jwt.sign(payload, env.SERVER_JWT_SECRET);
    }

    public static sanitizeGameSession(gameSession: any, role: string) {
        switch (role) {
            case 'HOST': {
                return gameSession;
            }

            case 'PARTICIPANT': {
                const rest = { ...gameSession };
                delete rest.hostScreen;
                delete rest.spectatorScreen;
                return rest;
            }

            case 'SPECTATOR': {
                const rest = { ...gameSession };
                delete rest.hostScreen;
                delete rest.participantScreen;
                delete rest.currentQuestionIndex;
                return rest;
            }

            default: {
                return {};
            }
        }
    }

    public static sanitizeCurrentQuestion(
        question: Partial<QuestionType>,
        role: USER_TYPE,
        hostScreen: HostScreen,
    ): Partial<QuestionType> | null {
        switch (role) {
            case USER_TYPE.HOST: {
                return question;
            }
            default: {
                switch (hostScreen) {
                    case HostScreen.QUESTION_READING: {
                        const rest = this.pick(question, ['imageUrl', 'question', 'readingTime']);
                        // const rest = { ...question };
                        // delete rest.basePoints;
                        // delete rest.correctAnswer;
                        // delete rest.explanation;
                        // delete rest.hint;
                        // delete rest.options;
                        // delete rest.orderIndex;
                        // delete rest.timeLimit;
                        return rest;
                    }
                    case HostScreen.QUESTION_ACTIVE: {
                        const rest = this.pick(question, [
                            'imageUrl',
                            'options',
                            'question',
                            'timeLimit',
                            question.hintLaunched ? 'hint' : 'hintLaunched',
                        ]);
                        // const rest = { ...question };
                        // delete rest.basePoints;
                        // delete rest.correctAnswer;
                        // delete rest.difficulty;
                        // delete rest.explanation;
                        // if (!rest.hintLaunched) delete rest.hint;
                        // delete rest.hintLaunched;
                        // delete rest.orderIndex;
                        // delete rest.readingTime;
                        return rest;
                    }
                    case HostScreen.QUESTION_RESULTS: {
                        const rest = { ...question };
                        delete rest.orderIndex;
                        delete rest.readingTime;
                        delete rest.timeLimit;
                        delete rest.hintLaunched;
                        return rest;
                    }
                    default:
                        return null;
                }
            }
        }
    }

    public static createSpectatorLink(quizId: string): string {
        const payload = {
            quizId,
        };
        const token = jwt.sign(payload, env.SERVER_JWT_SECRET);
        return `http://localhost:3000/join/${quizId}?spectator_token=${token}`;
    }

    public static verifyCookie(token: string): CookiePayload | null {
        try {
            return jwt.verify(token, env.SERVER_JWT_SECRET) as CookiePayload;
        } catch {
            return null;
        }
    }

    public static async record_quiz_view(
        quizId: string,
        userId: string,
    ): Promise<{ created: boolean }> {
        try {
            await prisma.quizViews.upsert({
                where: {
                    quizId_userId: {
                        quizId: quizId,
                        userId: userId,
                    },
                },
                update: {
                    viewedAt: new Date(),
                },
                create: {
                    quizId: quizId,
                    userId: userId,
                },
            });
            return { created: true };
        } catch (err) {
            console.error('Error recording quiz view:', err);
            return { created: false };
        }
    }
    private static pick<T extends object, K extends keyof T>(
        obj: T,
        keys: readonly K[],
    ): Pick<T, K> {
        const result = {} as Pick<T, K>;

        for (const key of keys) {
            if (key in obj) {
                result[key] = obj[key];
            }
        }

        return result;
    }
}
