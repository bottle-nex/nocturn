import { Prisma } from '@nocturn/database';
import { ReactorType } from '@nocturn/types';
import { Interactions } from '@nocturn/database';

export interface CreateLifelineUsageJob {
    participant_id: string;
    game_session_id: string;
}

export interface UpdateGameSessionJobtype {
    id: string;
    game_session_id: string;
    gameSession: Prisma.GameSessionUpdateInput;
}

export interface UpdateParticipantJobType {
    id: string;
    game_session_id: string;
    participant: Prisma.ParticipantUpdateInput;
}

export interface UpdateSpectatorJobType {
    id: string;
    game_session_id: string;
    spectator: Prisma.SpectatorUpdateInput;
}

export interface UpdateQuizJobType {
    id: string;
    game_session_id: string;
    quiz: Prisma.QuizUpdateInput;
}

export interface CreateChatMessageJobType {
    id: string;
    game_session_id: string;
    quiz_id: string;
    chatMessage: {
        senderId: string;
        senderRole: string;
        senderName: string;
        senderAvatar: string;
        message: string;
        repliedToId?: string;
    };
}

export interface CreateChatReactionJobType {
    id: string;
    chat_message_id: string;
    chat_reaction: {
        reactorType: ReactorType;
        reactorName: string;
        reactorAvatar: string;
        reaction: Interactions;
        reactedAt?: Date;
    };
}

export interface CreateParticipantResponseJobType {
    id: string;
    game_session_id: string;
    response: {
        selectedAnswer: number;
        isCorrect: boolean;
        timeToAnswer: number;
        pointsEarned: number;
        timeBonus: number;
        streakBonus: number;
        answeredAt: Date;
        questionId: string;
    };
}

export interface UpdateQuestionJobType {
    game_session_id: string;
    question_id: string;
    question: Prisma.QuestionUpdateInput;
}
