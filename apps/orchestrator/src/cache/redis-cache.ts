import { GameSession, Question, Response, Spectator } from "@repo/db/client";
import Redis from "ioredis";
import { Participant, Quiz } from "@repo/db/client";
import dotenv from "dotenv";
import { Env } from "../configs/env";
dotenv.config();

const SECONDS = 60;
const MINUTES = 60;
const HOURS = 24;
const REDIS_URL = Env.ORCH_REDIS_URL;

type QuizWithQuestions = Quiz & {
  questions: Question[];
};

export default class RedisCache {
  private redis_cache: Redis;

  constructor() {
    this.redis_cache = new Redis(REDIS_URL!);
  }

  //  <------------------ GAME_SESSION ------------------>

  public async set_game_session(
    game_live_session_id: string,
    game_live_session: Partial<GameSession>,
  ) {
    try {
      const key = this.get_game_session_key(game_live_session_id);
      const entries: [string, string][] = Object.entries(game_live_session).map(
        ([key, value]) => [key, JSON.stringify(value)],
      );
      await this.redis_cache.hset(key, ...entries.flat());
      await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
    } catch (err) {
      console.error("Error in session management while creating session", err);
    }
  }

  public async get_game_session(
    sessionId: string,
  ): Promise<Partial<GameSession> | null> {
    try {
      const key = this.get_game_session_key(sessionId);
      const data = await this.redis_cache.hgetall(key);

      if (Object.keys(data).length === 0) return null;

      const parsed: Partial<GameSession> = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          parsed[key as keyof GameSession] = JSON.parse(value);
        } catch {
          parsed[key as keyof GameSession] = value as any;
        }
      }

      return parsed;
    } catch (err) {
      console.error("RedisCache error get_game_session : ", err);
      return null;
    }
  }

  public async delete_game_session(game_live_session_id: string) {
    try {
      const key = this.get_game_session_key(game_live_session_id);
      await this.redis_cache.del(key);
    } catch (err) {
      console.error("RedisCache error delete_game_session : ", err);
    }
  }

  private get_game_session_key(game_live_session_id: string) {
    return `game_session:${game_live_session_id}`;
  }

  //  <------------------ PARTICIPANT ------------------>

  public async get_participant(
    game_session_id: string,
    participant_id: string,
  ) {
    const key = this.get_participants_key(game_session_id);
    try {
      const data = await this.redis_cache.hget(key, participant_id);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Error in get_participant:", err);
      return null;
    }
  }

  public async get_all_participants(
    game_session_id: string,
    fields?: (keyof Participant)[],
  ) {
    const key = this.get_participants_key(game_session_id);
    try {
      const data = await this.redis_cache.hgetall(key);
      if (!data) return [];

      return Object.entries(data).map(([id, value]) => {
        const participant = JSON.parse(value);

        // this will always include participant_id
        if (fields && fields.length > 0) {
          const filtered: any = { id };
          for (const field of fields) {
            if (participant[field] !== undefined) {
              filtered[field] = participant[field];
            }
          }
          return filtered;
        }

        // if no field specified return complete participant
        return { id, ...participant };
      });
    } catch (err) {
      console.error("Error in get_all_participants:", err);
      return [];
    }
  }

  public async set_participants(
    game_session_id: string,
    participant_id: string,
    particpant: Partial<Participant>,
  ) {
    try {
      const key = this.get_participants_key(game_session_id);
      await this.redis_cache.hset(
        key,
        participant_id,
        JSON.stringify(particpant),
      );
      await this.redis_cache.expire(key, 60 * 60 * 24);
    } catch (err) {
      console.error("Error while setting participant in cache : ", err);
    }
  }

  public async delete_participant(
    game_session_id: string,
    participant_id: string,
  ) {
    const key = this.get_participants_key(game_session_id);
    try {
      await this.redis_cache.hdel(key, participant_id);
    } catch (error) {
      console.error("Error in delete-participant: ", error);
    }
  }

  private get_participants_key(game_session_id: string) {
    return `game_session:${game_session_id}:participants`;
  }

  //  <------------------ RESPONSE ------------------>

  public async set_participant_response(
    game_session_id: string,
    question_id: string,
    participant_id: string,
    response: Partial<Response>,
  ) {
    try {
      const key = this.get_participant_response_key(game_session_id);
      const unique_key = this.get_unique_key_to_response(
        question_id,
        participant_id,
      );

      await this.redis_cache.hset(key, unique_key, JSON.stringify(response));
      await this.redis_cache.expire(key, 60 * 60 * 24);
    } catch (error) {
      console.error(
        "Error while setting participant response in cache: ",
        error,
      );
    }
  }

  public async get_participant_response(
    game_session_id: string,
    question_id: string,
    participant_id: string,
  ) {
    try {
      const key = this.get_participant_response_key(game_session_id);
      const unique_key = this.get_unique_key_to_response(
        question_id,
        participant_id,
      );

      const data = await this.redis_cache.hget(key, unique_key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        "Error while getting participant response from cache: ",
        error,
      );
      return null;
    }
  }

  public async get_all_question_responses(
    game_session_id: string,
    question_id: string,
    fields?: (keyof Response)[],
  ) {
    const key = this.get_participant_response_key(game_session_id);
    try {
      const data = await this.redis_cache.hgetall(key);
      if (!data) return [];

      return (
        Object.entries(data)

          // filter responses for this question
          .filter(
            ([unique_key]) =>
              unique_key.startsWith(`${question_id}`) ||
              unique_key.startsWith(`${question_id}_`),
          )
          .map(([unique_key, value]) => {
            const response = JSON.parse(value);
            const participant_id = unique_key.split("_")[1];

            // this will always includeresponseId and participantId
            if (fields && fields.length > 0) {
              const filtered: any = {
                id: response.id,
                participantId: participant_id,
              };
              for (const field of fields) {
                if (response[field] !== undefined) {
                  filtered[field] = response[field];
                }
              }
              return filtered;
            }

            // if no field specified return complete response
            return {
              id: response.id,
              participantId: participant_id,
              ...response,
            };
          })
      );
    } catch (err) {
      console.error("Error in get_all_question_responses:", err);
      return [];
    }
  }

  private get_unique_key_to_response(
    question_id: string,
    participant_id: string,
  ) {
    return `${question_id}_${participant_id}`;
  }

  private get_participant_response_key(game_session_id: string) {
    return `game_session:${game_session_id}:responses`;
  }

  //  <------------------ SPECTATOR ------------------>

  public async set_spectator(
    game_session_id: string,
    spectator_id: string,
    spectator: Partial<Spectator>,
  ) {
    try {
      const key = this.get_spectator_key(game_session_id);
      await this.redis_cache.hset(key, spectator_id, JSON.stringify(spectator));
      await this.redis_cache.expire(key, 60 * 60 * 24);
    } catch (error) {
      console.error("Error while setting spectator in cache: ", error);
    }
  }

  public async get_spectator(game_session_id: string, spectator_id: string) {
    const key = this.get_spectator_key(game_session_id);
    try {
      const data = await this.redis_cache.hget(key, spectator_id);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error in get-spectator: ", error);
      return null;
    }
  }

  public async delete_spectator(game_session_id: string, spectator_id: string) {
    const key = this.get_spectator_key(game_session_id);
    try {
      await this.redis_cache.hdel(key, spectator_id);
    } catch (error) {
      console.error("Error in delete-spectator: ", error);
    }
  }

  public get_spectator_key(game_session_id: string) {
    return `game_session:${game_session_id}:spectators`;
  }

  //  <------------------ QUIZ ------------------>

  public async set_quiz(
    game_session_id: string,
    quiz_id: string,
    quiz: Partial<Quiz>,
  ) {
    try {
      const key = this.get_quiz_key(game_session_id);

      const entries: [string, string][] = Object.entries(quiz).map(
        ([key, value]) => [key, JSON.stringify(value)],
      );
      await this.redis_cache.hset(key, ...entries.flat());
      await this.redis_cache.expire(key, SECONDS * MINUTES * HOURS);
    } catch (error) {
      console.error("Error while setting quiz in cache : ", error);
    }
  }

  public async get_quiz(
    game_session_id: string,
  ): Promise<Partial<QuizWithQuestions> | null> {
    try {
      const key = this.get_quiz_key(game_session_id);
      const data = await this.redis_cache.hgetall(key);

      if (Object.keys(data).length === 0) return null;

      const parsed: Partial<Quiz> = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          const parsedValue = JSON.parse(value);

          parsed[key as keyof Quiz] = parsedValue;
        } catch (parseError) {
          if (key === "questions") {
            console.error(
              `Critical field 'questions' failed to parse. Raw value:`,
              parseError,
            );
            return null;
          }

          parsed[key as keyof Quiz] = value as any;
        }
      }

      return parsed as Partial<QuizWithQuestions>;
    } catch (error) {
      console.error("RedisCache error get_quiz : ", error);
      return null;
    }
  }

  private get_quiz_key(game_session_id: string): string {
    return `game_session:${game_session_id}:quiz`;
  }

  //  <------------------ PHASE ------------------>

  public async try_acquire_lock(
    lock_key: string,
    lock_value: string,
    ttl_seconds: number,
  ) {
    try {
      const result = await this.redis_cache.set(
        lock_key,
        lock_value,
        "EX",
        ttl_seconds,
        "NX",
      );
      return result === "OK";
    } catch (err) {
      console.error("error in try_acquire_lock", err);
    }
  }

  public async renew_lock(
    lock_key: string,
    ttl_seconds: number,
  ): Promise<boolean> {
    try {
      const result = await this.redis_cache.expire(lock_key, ttl_seconds);
      return result === 1;
    } catch (err) {
      console.error(`Error renewing lock ${lock_key}:`, err);
      return false;
    }
  }

  public async get_lock_owner(lock_key: string): Promise<string | null> {
    try {
      return await this.redis_cache.get(lock_key);
    } catch (err) {
      console.error(`Error reading lock owner ${lock_key}:`, err);
      return null;
    }
  }
}
