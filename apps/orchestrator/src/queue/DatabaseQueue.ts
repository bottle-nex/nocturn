import Bull, { JobOptions } from "bull";
import prisma, {
  GameSession,
  Participant,
  Prisma,
  Quiz,
  Spectator,
  ChatMessage,
  ChatReaction,
  Interactions,
  Response,
} from "@repo/db/client";

import { redisCacheInstance } from "../services/init-services";
import { ReactorType } from "../types/types";
import RedisCache from "../cache/redis-cache";
import { JobOption, QueueJobTypes } from "../types/database-queue-types";
import { Env } from "../configs/env";
const REDIS_URL = Env.ORCH_REDIS_URL;

interface UpdateGameSessionJobtype {
  id: string;
  game_session_id: string;
  gameSession: Prisma.GameSessionUpdateInput;
}

interface UpdateParticipantJobType {
  id: string;
  game_session_id: string;
  participant: Prisma.ParticipantUpdateInput;
}

interface UpdateSpectatorJobType {
  id: string;
  game_session_id: string;
  spectator: Prisma.SpectatorUpdateInput;
}

interface UpdateQuizJobType {
  id: string;
  game_session_id: string;
  quiz: Prisma.QuizUpdateInput;
}

interface CreateChatMessageJobType {
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

interface CreateChatReactionJobType {
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

interface CreateParticipantResponseJobType {
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

export default class DatabaseQueue {
  private database_queue: Bull.Queue;
  private redis_cache: RedisCache;
  private default_job_options: JobOptions = {
    attempts: 3,
    delay: 1000,
    removeOnFail: 5,
    removeOnComplete: 10,
  };

  constructor() {
    this.redis_cache = redisCacheInstance;
    this.database_queue = new Bull("database-operations", {
      redis: REDIS_URL,
    });
    this.setupProcessors();
  }

  private setupProcessors() {
    this.database_queue.process(
      QueueJobTypes.UPDATE_GAME_SESSION,
      this.update_game_session_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.UPDATE_QUIZ,
      this.update_quiz_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.UPDATE_PARTICIPANT,
      this.update_participant_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.UPDATE_SPECTATOR,
      this.update_spectator_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.CREATE_CHAT_MESSAGE,
      this.create_chat_message_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.CREATE_CHAT_REACTION,
      this.create_chat_reaction_processor.bind(this),
    );
    this.database_queue.process(
      QueueJobTypes.CREATE_PARTICIPANT_RESPONSE,
      this.create_participant_response_processor.bind(this),
    );
  }

  private async update_spectator_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; spectator: Spectator }
    | { success: boolean; error: string }
  > {
    const { id, game_session_id, spectator }: UpdateSpectatorJobType = job.data;

    try {
      const updatedSpectator = await prisma.spectator.update({
        where: {
          id: id,
        },
        data: spectator,
      });

      this.redis_cache.set_spectator(
        game_session_id,
        updatedSpectator.id,
        updatedSpectator,
      );

      return { success: true, spectator: updatedSpectator };
    } catch (error) {
      console.error(`Error while updating spectator: `, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async update_participant_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; participant: Participant }
    | { success: boolean; error: string }
  > {
    const { id, game_session_id, participant }: UpdateParticipantJobType =
      job.data;
    try {
      const updatedParticipant = await prisma.participant.update({
        where: {
          id: id,
        },
        data: participant,
      });

      await this.redis_cache.set_participants(
        game_session_id,
        updatedParticipant.id,
        updatedParticipant,
      );
      return { success: true, participant: updatedParticipant };
    } catch (error) {
      console.error(`Error while updating participant: `, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async update_game_session_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; gameSession: GameSession }
    | { success: boolean; error: string }
  > {
    const { gameSession, game_session_id }: UpdateGameSessionJobtype = job.data;

    try {
      const updatedGameSession = await prisma.gameSession.update({
        where: {
          id: game_session_id,
        },
        data: gameSession,
      });
      await this.redis_cache.set_game_session(
        game_session_id,
        updatedGameSession,
      );
      return { success: true, gameSession: updatedGameSession };
    } catch (err) {
      console.error("Error while processing game session update", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  private async update_quiz_processor(
    job: Bull.Job,
  ): Promise<
    { success: boolean; quiz: Quiz } | { success: boolean; error: string }
  > {
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
      console.error("Error while processing quiz update", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  private async create_chat_message_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; chatMessage: ChatMessage }
    | { success: boolean; error: string }
  > {
    try {
      const {
        quiz_id,
        game_session_id,
        chatMessage,
      }: CreateChatMessageJobType = job.data;

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
      console.error("Error while processing chat message create: ", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async create_chat_reaction_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; chatReaction: ChatReaction }
    | { success: boolean; error: string }
  > {
    try {
      const { chat_reaction, chat_message_id }: CreateChatReactionJobType =
        job.data;

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
      console.error("Error while processing chat reaction create: ", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async create_participant_response_processor(
    job: Bull.Job,
  ): Promise<
    | { success: boolean; participantResponse: Response }
    | { success: boolean; error: string }
  > {
    try {
      const {
        id,
        response,
        game_session_id,
      }: CreateParticipantResponseJobType = job.data;

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
      console.error("Error while processing participant resposne: ", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public async update_game_session(
    id: string,
    gameSession: Prisma.GameSessionUpdateInput,
    game_session_id: string,
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue.add(
      QueueJobTypes.UPDATE_GAME_SESSION,
      { id, gameSession, game_session_id },
      { ...this.default_job_options, ...options },
    );
  }

  // public async update_quiz(
  //   id: string,
  //   quiz: Prisma.QuizUpdateInput,
  //   game_session_id: string,
  //   options?: Partial<JobOption>,
  // ) {
  //   return await this.database_queue.add(
  //     QueueJobTypes.UPDATE_QUIZ,
  //     { id, quiz, game_session_id },
  //     { ...this.default_job_options, ...options },
  //   );
  // }

  public async update_participant(
    id: string,
    participant: Prisma.ParticipantUpdateInput,
    game_session_id: string,
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue.add(
      QueueJobTypes.UPDATE_PARTICIPANT,
      { id, participant, game_session_id },
      { ...this.default_job_options, ...options },
    );
  }

  public async update_spectator(
    id: string,
    spectator: Prisma.SpectatorUpdateInput,
    game_session_id: string,
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue.add(
      QueueJobTypes.UPDATE_SPECTATOR,
      { id, spectator, game_session_id },
      { ...this.default_job_options, ...options },
    );
  }

  public async create_chat_message(
    id: string,
    game_session_id: string,
    quiz_id: string,
    chatMessage: {
      senderId: string;
      senderRole: string;
      senderName: string;
      senderAvatar: string;
      message: string;
      repliedToId?: string | null;
    },
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue.add(
      QueueJobTypes.CREATE_CHAT_MESSAGE,
      { id, game_session_id, quiz_id, chatMessage },
      { ...this.default_job_options, ...options },
    );
  }

  public async create_chat_reaction(
    id: string,
    chat_message_id: string,
    chat_reaction: {
      reactedAt: Date;
      reaction: Interactions;
      reactorAvatar: string;
      reactorName: string;
      reactorType: ReactorType;
    },
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue
      .add(
        QueueJobTypes.CREATE_CHAT_REACTION,
        { id, chat_message_id, chat_reaction },
        { ...this.default_job_options, ...options },
      )
      .catch((err) => console.error("Failed to enqueue chat reaction:", err));
  }

  public async create_participant_response(
    id: string,
    game_session_id: string,
    response: {
      selectedAnswer: number;
      isCorrect: boolean;
      timeToAnswer: number;
      pointsEarned: number;
      timeBonus: number;
      streakBonus: number;
      answeredAt: Date;
      questionId: string;
    },
    options?: Partial<JobOption>,
  ) {
    return await this.database_queue
      .add(
        QueueJobTypes.CREATE_PARTICIPANT_RESPONSE,
        { id, game_session_id, response },
        { ...this.default_job_options, ...options },
      )
      .catch((err) =>
        console.error("Failed to enqueue participant response: ", err),
      );
  }
}
