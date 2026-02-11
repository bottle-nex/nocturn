import Bull from 'bull';
import {
    prisma,
    GameSession,
    Participant,
    Quiz,
    Spectator,
    ChatMessage,
    ChatReaction,
    Response,
    Question,
} from '@nocturn/database';
import { v4 as uuid } from 'uuid';
import {
    CreateLifelineUsageJob,
    UpdateGameSessionJobtype,
    UpdateParticipantJobType,
    UpdateSpectatorJobType,
    UpdateQuizJobType,
    CreateChatMessageJobType,
    CreateChatReactionJobType,
    CreateParticipantResponseJobType,
    UpdateQuestionJobType,
} from '../../types/job.database.types';
import RedisCache from '../../cache/redis.cache';

export class DatabaseQueueProcessors {
    constructor(private redis_cache: RedisCache) {}

    async create_lifeline_usage_processor(
        job: Bull.Job,
    ): Promise<{ success: boolean; lifelineUsage?: any } | { success: boolean; error: string }> {
        try {
            const { participant_id, game_session_id }: CreateLifelineUsageJob = job.data;

            const lifelineUsage = await prisma.lifelineUsage.create({
                data: {
                    id: uuid(),
                    participant: { connect: { id: participant_id } },
                    gameSession: { connect: { id: game_session_id } },
                },
            });

            return {
                success: true,
                lifelineUsage,
            };
        } catch (error) {
            console.error('Error while creating lifeline usage: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async update_spectator_processor(
        job: Bull.Job,
    ): Promise<{ success: boolean; spectator: Spectator } | { success: boolean; error: string }> {
        const { id, game_session_id, spectator }: UpdateSpectatorJobType = job.data;

        try {
            const updatedSpectator = await prisma.spectator.update({
                where: {
                    id: id,
                },
                data: spectator,
            });

            this.redis_cache.set_spectator(game_session_id, updatedSpectator.id, updatedSpectator);

            return { success: true, spectator: updatedSpectator };
        } catch (error) {
            console.error(`Error while updating spectator: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async update_participant_processor(
        job: Bull.Job,
    ): Promise<
        { success: boolean; participant: Participant } | { success: boolean; error: string }
    > {
        const { id, game_session_id, participant }: UpdateParticipantJobType = job.data;
        try {
            const updatedParticipant = await prisma.participant.update({
                where: {
                    id: id,
                },
                data: participant,
            });
            await this.redis_cache.set_participant(
                game_session_id,
                updatedParticipant.id,
                updatedParticipant,
            );

            return { success: true, participant: updatedParticipant };
        } catch (error) {
            console.error(`Error while updating participant: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async update_game_session_processor(
        job: Bull.Job,
    ): Promise<
        { success: boolean; gameSession: GameSession } | { success: boolean; error: string }
    > {
        const { gameSession, game_session_id }: UpdateGameSessionJobtype = job.data;

        try {
            const updatedGameSession = await prisma.gameSession.update({
                where: {
                    id: game_session_id,
                },
                data: gameSession,
            });
            await this.redis_cache.set_game_session(game_session_id, updatedGameSession);
            return { success: true, gameSession: updatedGameSession };
        } catch (err) {
            console.error('Error while processing game session update', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }

    async update_quiz_processor(
        job: Bull.Job,
    ): Promise<{ success: boolean; quiz: Quiz } | { success: boolean; error: string }> {
        try {
            const { id, quiz }: UpdateQuizJobType = job.data;
            const updateQuiz = await prisma.quiz.update({
                where: {
                    id,
                },
                data: quiz,
            });
            return { success: true, quiz: updateQuiz };
        } catch (err) {
            console.error('Error while processing quiz update', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }

    async create_chat_message_processor(
        job: Bull.Job,
    ): Promise<
        { success: boolean; chatMessage: ChatMessage } | { success: boolean; error: string }
    > {
        try {
            const { quiz_id, game_session_id, chatMessage }: CreateChatMessageJobType = job.data;

            const createChatMessage = await prisma.chatMessage.create({
                data: {
                    gameSession: { connect: { id: game_session_id } },
                    quiz: { connect: { id: quiz_id } },
                    senderId: chatMessage.senderId,
                    senderRole: chatMessage.senderRole,
                    senderName: chatMessage.senderName,
                    senderAvatar: chatMessage.senderAvatar,
                    message: chatMessage.message,
                    repliedTo: chatMessage.repliedToId
                        ? { connect: { id: chatMessage.repliedToId } }
                        : undefined,
                },
            });

            return {
                success: true,
                chatMessage: createChatMessage,
            };
        } catch (error) {
            console.error('Error while processing chat message create: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async create_chat_reaction_processor(
        job: Bull.Job,
    ): Promise<
        { success: boolean; chatReaction: ChatReaction } | { success: boolean; error: string }
    > {
        try {
            const { chat_reaction, chat_message_id }: CreateChatReactionJobType = job.data;

            const createChatReaction = await prisma.chatReaction.create({
                data: {
                    ...chat_reaction,
                    chatMessage: { connect: { id: chat_message_id } },
                    reactorName: chat_reaction.reactorName,
                    reactorAvatar: chat_reaction.reactorAvatar,
                    reactedAt: chat_reaction.reactedAt,
                    reaction: chat_reaction.reaction,
                    reactorType: chat_reaction.reactorType,
                },
            });

            return {
                success: true,
                chatReaction: createChatReaction,
            };
        } catch (error) {
            console.error('Error while processing chat reaction create: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async create_participant_response_processor(
        job: Bull.Job,
    ): Promise<
        { success: boolean; participantResponse: Response } | { success: boolean; error: string }
    > {
        try {
            const { id, response, game_session_id }: CreateParticipantResponseJobType = job.data;

            const createPariticipantResponse = await prisma.response.create({
                data: {
                    selectedAnswer: response.selectedAnswer,
                    isCorrect: response.isCorrect,
                    timeToAnswer: response.timeToAnswer ?? 0,
                    pointsEarned: response.pointsEarned,
                    timeBonus: response.timeBonus,
                    streakBonus: response.streakBonus,
                    answeredAt: response.answeredAt,
                    question: { connect: { id: response.questionId } },
                    participant: { connect: { id: id } },
                    gameSession: { connect: { id: game_session_id } },
                },
            });

            await this.redis_cache.set_participant_response(
                game_session_id,
                response.questionId,
                id,
                createPariticipantResponse,
            );

            return {
                success: true,
                participantResponse: createPariticipantResponse,
            };
        } catch (error) {
            console.error('Error while processing participant resposne: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async update_question_processor(
        job: Bull.Job,
    ): Promise<{ success: boolean; question: Question } | { success: boolean; error: string }> {
        try {
            const { game_session_id, question_id, question }: UpdateQuestionJobType = job.data;

            const updatedQuestion = await prisma.question.update({
                where: {
                    id: question_id,
                },
                data: question,
            });

            await this.redis_cache.set_quiz(game_session_id, {});

            return {
                success: true,
                question: updatedQuestion,
            };
        } catch (error) {
            console.error('Error while processing update question: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
