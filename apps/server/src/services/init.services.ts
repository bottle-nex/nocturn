import RedisCache from '../cache/redis.cache';
import PhaseQueue from '../queue/PhaseQueue';
import QuizManager from '../sockets/QuizManager';
import Redis from 'ioredis';
import { env } from '../configs/env';
import QuizSettings from '../class/quizSettings';
import EmailServiceQueue from './email/email.services';
import Model from '../gen/agents/Model';
import Agent from '../gen/agents/Agent';
import CollabStateCache from '../cache/collab_state.cache';
import DodoPaymentService from './premium/DodoPaymentService';
import DodoWebhookService from './premium/DodoWebhookService';
import DatabaseQueue from '../queue/database/database.queue';
import { CompiledStateGraph } from '@langchain/langgraph';

export let redisCacheInstance: RedisCache;
export let databaseQueueInstance: DatabaseQueue;
export let phaseQueueInstance: PhaseQueue;
export let quizManagerInstance: QuizManager;
export let quizSettingInstance: QuizSettings;
export let email_service_queue_instance: EmailServiceQueue;
export let publisherInstance: Redis;
export let subscriberInstance: Redis;
export let collabStateCacheInstance: CollabStateCache;
export let dodo_payment_service: DodoPaymentService;
export let dodo_webhook_service: DodoWebhookService;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let quizAgentGraph: CompiledStateGraph<any, any, any>;
export let model: Model;

export default async function initServices() {
    publisherInstance = new Redis(env.SERVER_REDIS_URL);
    subscriberInstance = new Redis(env.SERVER_REDIS_URL);
    redisCacheInstance = new RedisCache();
    email_service_queue_instance = new EmailServiceQueue('email-service-queue');
    databaseQueueInstance = new DatabaseQueue();
    collabStateCacheInstance = new CollabStateCache();
    dodo_payment_service = new DodoPaymentService(
        env.SERVER_NODE_ENV === 'development' ? 'test' : 'production',
    );
    dodo_webhook_service = new DodoWebhookService();
    quizManagerInstance = new QuizManager({
        publisher: publisherInstance,
        subscriber: subscriberInstance,
        redis_cache: redisCacheInstance,
        database_queue: databaseQueueInstance,
    });

    phaseQueueInstance = new PhaseQueue();
    quizSettingInstance = new QuizSettings();

    phaseQueueInstance.set_quiz_manager(quizManagerInstance);
    quizManagerInstance.set_phase_queue(phaseQueueInstance);

    await subscriberInstance.subscribe('__keyevent@0__:expired');

    model = new Model();
    quizAgentGraph = Agent.create_graph();
}
