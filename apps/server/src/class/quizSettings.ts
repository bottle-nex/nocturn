import { Prisma } from '@nocturn/database';
import Redis from 'ioredis';
import { QuizSetting, quizSettingsSchema } from '../schemas/quizSettingsSchema';
import {
    databaseQueueInstance,
    quizManagerInstance,
    redisCacheInstance,
} from '../services/init.services';
import QuizManager from '../sockets/QuizManager';
import { MESSAGE_TYPES, PubSubMessageTypes, SubscriptionEnum } from '@nocturn/types';
import DatabaseQueue from '../queue/database/database.queue';
import { FEATURE, planManager } from '@nocturn/premium';

export default class QuizSettings {
    public quiz_settings_mapping: Map<string, QuizSetting> = new Map();
    private database_queue: DatabaseQueue;
    private quiz_manager: QuizManager;
    private redis: Redis;

    constructor() {
        this.database_queue = databaseQueueInstance;
        this.quiz_manager = quizManagerInstance;
        this.redis = redisCacheInstance.redis_cache;
        this.fill_settings_on_boot();
    }

    public async update_quiz_settings_on_db_and_cache(
        game_session_id: string,
        quiz_id: string,
        host_id: string,
        payload: any,
    ) {
        try {
            const parsed_payload = quizSettingsSchema.safeParse(payload);
            if (!parsed_payload.success) {
                return;
            }

            const { liveChat, allowNewSpectator } = parsed_payload.data;

            const subscription = await redisCacheInstance.get_host(game_session_id, host_id, [
                'subscription',
            ]);

            const liveChatAllowed = planManager.isEnabled(
                (subscription as unknown as SubscriptionEnum) ?? SubscriptionEnum.FREE,
                FEATURE.LIVE_CHAT,
            );
            const spectatorsAllowed = planManager.isEnabled(
                (subscription as unknown as SubscriptionEnum) ?? SubscriptionEnum.FREE,
                FEATURE.MAX_SPECTATORS_PER_SESSION,
            );

            if (liveChat && !liveChatAllowed) {
                // send a reponse that you're not a pro user
                return;
            }

            if (allowNewSpectator && !spectatorsAllowed) {
                // send a response that you're not a pro user
                return;
            }

            const quiz: Prisma.QuizUpdateInput = {
                liveChat,
                allowNewSpectator,
            };

            this.database_queue.update_quiz(quiz_id, quiz, game_session_id);
            const pubsubEvent: PubSubMessageTypes = {
                type: MESSAGE_TYPES.SETTINGS_CHANGE,
                payload: { ...parsed_payload.data, game_session_id },
            };

            this.quiz_manager.publish_event_to_redis(game_session_id, pubsubEvent);
            this.update_memory_settings_state(game_session_id, parsed_payload.data);
            this.write_settings_to_redis(game_session_id, parsed_payload.data);
        } catch (err) {
            console.error('error in updating settings', err);
        }
    }

    public update_memory_settings_state(game_session_id: string, data: QuizSetting) {
        this.quiz_settings_mapping.set(game_session_id, data);
    }

    public async seed_settings_for_session(game_session_id: string): Promise<void> {
        try {
            const quiz_key = this.get_quiz_key(game_session_id);
            const settings_from_redis = await this.redis.hmget(
                quiz_key,
                'liveChat',
                'allowNewSpectator',
            );
            const [live_chat_raw, allow_new_spectator_raw] = settings_from_redis;
            if (allow_new_spectator_raw === null && live_chat_raw === null) {
                console.warn('empty from the redis');
                return;
            }
            const parsed = quizSettingsSchema.safeParse({
                liveChat: live_chat_raw !== null ? JSON.parse(live_chat_raw) : undefined,
                allowNewSpectator:
                    allow_new_spectator_raw !== null
                        ? JSON.parse(allow_new_spectator_raw)
                        : undefined,
            });
            if (!parsed.success) {
                console.error('Error parsing settings from redis', parsed.error);
                return;
            }
            this.quiz_settings_mapping.set(game_session_id, parsed.data);
        } catch (err) {
            console.error('Error seeding settings for session', err);
        }
    }

    private write_settings_to_redis(game_session_id: string, data: QuizSetting) {
        const quiz_key = this.get_quiz_key(game_session_id);
        const updates: string[] = [];

        if (data.liveChat !== undefined) {
            updates.push('liveChat', JSON.stringify(data.liveChat));
        }
        if (data.allowNewSpectator !== undefined) {
            updates.push('allowNewSpectator', JSON.stringify(data.allowNewSpectator));
        }
        if (updates.length > 0) {
            this.redis
                .hset(quiz_key, ...updates)
                .catch((err) => console.error('Error writing quiz fields to redis', err));
        }
    }

    private get_quiz_key(game_session_id: string): string {
        return `game_session:${game_session_id}:quiz`;
    }

    public cleanup_session(game_session_id: string): void {
        this.quiz_settings_mapping.delete(game_session_id);
    }

    private fill_settings_on_boot() {}
}
