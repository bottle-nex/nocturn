import prisma from '@repo/db/client';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CookiePayload, USER_TYPE } from '../types/web-socket-types';
import { env } from '../configs/env';
dotenv.config();
const JWT_SECRET = env.SERVER_JWT_SECRET;

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

    static async deleteQuiz(quizId: string) {
        await prisma.quiz.delete({
            where: {
                id: quizId,
            },
        });
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

        return jwt.sign(payload, JWT_SECRET!);
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
        const token = jwt.sign(payload, JWT_SECRET!);
        return `http://localhost:3000/join/${quizId}?spectator_token=${token}`;
    }

    public static verifyCookie(token: string): CookiePayload | null {
        try {
            return jwt.verify(token, JWT_SECRET!) as CookiePayload;
        } catch {
            return null;
        }
    }
}
