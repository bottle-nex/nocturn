import { prisma } from '@nocturn/database';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';
import { CookiePayload, USER_TYPE } from '@nocturn/types';
import { env } from '../configs/env';

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
        await prisma.quiz.delete({
            where: {
                id: quizId,
                hostId: userId,
            },
        });
    }

    static async moveToTrash(quizId: string, userId: string) {
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
    }

    static async validOwner(hostId: number, quizId: string): Promise<boolean> {
        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId,
                hostId: String(hostId),
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

    public static generateUserToken(
        userId: string,
        quizId: string,
        gameSessionId: string,
        role: USER_TYPE,
    ): string {
        const tokenId = QuizAction.generateTokenId();
        const payload: CookiePayload = {
            userId,
            quizId,
            gameSessionId,
            role,
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
}
