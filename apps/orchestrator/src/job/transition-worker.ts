import RedisCache from "../cache/redis-cache";
import PhaseQueueProcessor from "../client/phase-queue-processor";
import Publisher from "../client/publisher";
import DatabaseQueue from "../queue/DatabaseQueue";
import {
  databaseQueueInstance,
  phaseQueueProcessorInstance,
  publisherInstnace,
  redisCacheInstance,
} from "../services/init-services";
import {
  MESSAGE_TYPES,
  PhaseQueueJobDataType,
  PubSubMessageTypes,
  SECONDS,
} from "../types/types";
import {
  HostScreen,
  ParticipantScreen,
  QuizPhase,
  SpectatorScreen,
} from ".prisma/client";

export default class TransitionWorker {
  private redis_cache: RedisCache;
  private database_queue: DatabaseQueue;
  private publisher: Publisher;
  private phase_queue_processor: PhaseQueueProcessor;

  constructor() {
    this.redis_cache = redisCacheInstance;
    this.database_queue = databaseQueueInstance;
    this.publisher = publisherInstnace;
    this.phase_queue_processor = phaseQueueProcessorInstance;
  }
  public async handle_transition_phase(data: PhaseQueueJobDataType) {
    if (
      data.fromPhase === QuizPhase.QUESTION_READING &&
      data.toPhase === QuizPhase.QUESTION_ACTIVE
    ) {
      await this.handle_reading_to_active_transition_phase(data);
    } else if (
      data.fromPhase === QuizPhase.QUESTION_ACTIVE &&
      data.toPhase === QuizPhase.SHOW_RESULTS
    ) {
      await this.handle_active_to_results_transition_phase(data);
    }
  }

  private async handle_reading_to_active_transition_phase(
    data: PhaseQueueJobDataType,
  ) {
    const quiz = await this.redis_cache.get_quiz(data.gameSessionId);

    if (!quiz) {
      // send websocket message for error
      console.error("Quiz not found");
      return;
    }

    const question = quiz.questions?.find((q) => q.id === data.questionId);
    if (!question) {
      // send websocket message for error
      console.error(`Question with id: ${data.questionId} doesn't exist`);
      return;
    }

    const now = Date.now();
    const buffer = 2 * SECONDS; // 2 seconds
    const question_active_time = question.timeLimit * SECONDS;

    const start_time = now + buffer;
    const end_time = start_time + question_active_time;

    this.database_queue
      .update_game_session(
        data.gameSessionId,
        {
          hostScreen: HostScreen.QUESTION_ACTIVE,
          spectatorScreen: SpectatorScreen.QUESTION_ACTIVE,
          participantScreen: ParticipantScreen.QUESTION_ACTIVE,
          currentPhase: QuizPhase.QUESTION_ACTIVE,
          phaseStartTime: new Date(start_time),
          phaseEndTime: new Date(end_time),
        },
        data.gameSessionId,
      )
      .catch((err) => {
        console.error("Failed to enqueue question active phase:", err);
      });

    const pub_sub_message_to_participant: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_PARTICIPANT,
      payload: {
        questionOptions: question.options,
        participantScreen: ParticipantScreen.QUESTION_ACTIVE,
        startTime: start_time,
        endTime: end_time,
      },
    };
    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_participant,
    );

    const pub_sub_message_to_host: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_HOST,
      payload: {
        questionOptions: question.options,
        hostScreen: HostScreen.QUESTION_ACTIVE,
        startTime: start_time,
        endTime: end_time,
      },
    };
    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_host,
    );

    const pub_sub_message_to_spectator: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_ACTIVE_PHASE_TO_SPECTATOR,
      payload: {
        questionOptions: question.options,
        spectatorScreen: SpectatorScreen.QUESTION_ACTIVE,
        startTime: start_time,
        endTime: end_time,
      },
    };
    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_spectator,
    );

    await this.phase_queue_processor.schedule_phase_transition({
      gameSessionId: data.gameSessionId,
      questionId: data.questionId,
      questionIndex: data.questionIndex,
      fromPhase: QuizPhase.QUESTION_ACTIVE,
      toPhase: QuizPhase.SHOW_RESULTS,
      executeAt: end_time,
    });
  }

  private async handle_active_to_results_transition_phase(
    data: PhaseQueueJobDataType,
  ) {
    const quiz = await this.redis_cache.get_quiz(data.gameSessionId);

    if (!quiz) {
      console.error("Quiz not found");
      return;
    }

    const question = quiz.questions?.find((q) => q.id === data.questionId);

    if (!question) {
      console.error(`Question with id: ${data.questionId} doesn't exist`);
      return;
    }

    const now = Date.now();
    const buffer = 2 * SECONDS; // 2 seconds

    const start_time = now + buffer;

    this.database_queue
      .update_game_session(
        data.gameSessionId,
        {
          hostScreen: HostScreen.QUESTION_RESULTS,
          spectatorScreen: SpectatorScreen.QUESTION_RESULTS,
          participantScreen: ParticipantScreen.QUESTION_RESULTS,
          currentPhase: QuizPhase.SHOW_RESULTS,
          phaseStartTime: new Date(start_time),
          phaseEndTime: null, // will be controlled by host to choose to go to next question
        },
        data.gameSessionId,
      )
      .catch((err) => {
        console.error("Failed to enqueue show result phase:", err);
      });

    const score_of_all_participants =
      await this.redis_cache.get_all_participants(data.gameSessionId, [
        "totalScore",
        "finalRank",
        "longestStreak",
      ]);

    const response_of_all_participants =
      await this.redis_cache.get_all_question_responses(
        data.gameSessionId,
        data.questionId,
        ["isCorrect", "selectedAnswer", "pointsEarned"],
      );

    const pub_sub_message_to_participant: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_PARTICIPANT,
      payload: {
        scores: score_of_all_participants,
        responses: response_of_all_participants,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        participantScreen: ParticipantScreen.QUESTION_RESULTS,
        startTime: start_time,
      },
    };

    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_participant,
    );

    const pub_sub_message_to_host: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_HOST,
      payload: {
        scores: score_of_all_participants,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        hostScreen: HostScreen.QUESTION_RESULTS,
        startTime: start_time,
      },
    };
    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_host,
    );

    const pub_sub_message_to_spectator: PubSubMessageTypes = {
      type: MESSAGE_TYPES.QUESTION_RESULTS_PHASE_TO_SPECTATOR,
      payload: {
        scores: score_of_all_participants,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        spectatorScreen: SpectatorScreen.QUESTION_RESULTS,
        startTime: start_time,
      },
    };
    this.publisher.publish_event_to_redis(
      data.gameSessionId,
      pub_sub_message_to_spectator,
    );
  }

  public setPhaseQueueProcessor(phase_queue_processor: PhaseQueueProcessor) {
    this.phase_queue_processor = phase_queue_processor;
  }
}
