import { Prisma } from '@repo/db/client';
import DatabaseQueue from '../queue/DatabaseQueue';
import { QuizSetting, quizSettingsSchema } from '../schemas/quizSettingsSchema';
import { databaseQueueInstance, quizManagerInstance } from '../services/init-services';
import QuizManager from '../sockets/QuizManager';
import { MESSAGE_TYPES, PubSubMessageTypes } from '../types/web-socket-types';

export default class QuizSettings {
    public quiz_settings_mapping: Map<string, QuizSetting> = new Map();
    private database_queue: DatabaseQueue;
    private quiz_manager: QuizManager;
    constructor() {
        this.database_queue = databaseQueueInstance;
        this.quiz_manager = quizManagerInstance;
        this.fill_settings_on_boot();
    }

    public update_quiz_settings_on_db_and_cache(
        game_session_id: string,
        quiz_id: string,
        payload: any,
    ) {
        const parsed_payload = quizSettingsSchema.safeParse(payload);
        if (!parsed_payload.success) {
            return;
        }

        const quiz: Prisma.QuizUpdateInput = {
            liveChat: parsed_payload.data.liveChat,
            allowNewSpectator: parsed_payload.data.allowNewSpectator,
        };

        try {
            this.database_queue.update_quiz(quiz_id, quiz, game_session_id);
            const pubsubEvent: PubSubMessageTypes = {
                type: MESSAGE_TYPES.SETTINGS_CHANGE,
                payload: { ...parsed_payload.data, game_session_id },
            };

            this.quiz_manager.publish_event_to_redis(game_session_id, pubsubEvent);
            this.update_memory_settings_state(game_session_id, parsed_payload.data);
        } catch (err) {
            console.error('error in updating settings', err);
        }
    }

    public update_memory_settings_state(game_session_id: string, data: QuizSetting) {
        this.quiz_settings_mapping.set(game_session_id, data);
    }

    private fill_settings_on_boot() {}
}
