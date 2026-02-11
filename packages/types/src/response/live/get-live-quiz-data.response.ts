import { InteractionEnum, QuizStatusEnum, TemplateEnum, USER_TYPE } from "../../prisma/enums.prisma";
import { QuestionType } from "../../prisma/schemas.prisma";

export interface getLiveQuizDataResponse {
    quiz: {
        spectatorLink: string;
        id: string;
        title: string;
        description: string | null;
        theme: TemplateEnum;
        participantCode: string | null;
        spectatorCode: string | null;
        prizePool: number;
        currency: string;
        basePointsPerQuestion: number;
        pointsMultiplier: number;
        timeBonus: boolean;
        eliminationThreshold: number;
        questionTimeLimit: number;
        breakBetweenQuestions: number;
        status: QuizStatusEnum;
        interactions: InteractionEnum[];
        liveChat: boolean;
        spectatorMode: boolean;
        allowNewSpectator: boolean;
        host: {
            name: string;
            email: string;
            image: string | null;
        };
        _count: {
            questions: number;
            participants: number;
        };
    },
    gameSession: unknown,
    userData: {
        name: string;
        id: string;
        email: string;
        image: string | null;
        walletAddress: string | null;
        isVerified: boolean;
    } | {
        id: string;
        walletAddress: string | null;
        nickname: string;
        avatar: string | null;
        isNameChanged: boolean;
        isEliminated: boolean;
        eliminatedAt: Date | null;
        eliminatedAtQuestion: string | null;
        finalRank: number | null;
        totalScore: number;
        correctAnswers: number;
        longestStreak: number;
    } | {
        id: string;
        joinedAt: Date;
        nickname: string;
        avatar: string | null;
    },
    participants: {
        id: string;
        nickname: string;
        avatar: string | null;
        finalRank: number | null;
        totalScore: number;
    }[];
    spectators: {
        id: string;
        nickname: string;
        avatar: string | null;
    }[];
    currentQuestion: Partial<QuestionType> | null;
    role: USER_TYPE;
}