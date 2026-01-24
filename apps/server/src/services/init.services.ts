import RedisCache from '../cache/redis.cache';
import DatabaseQueue from '../queue/DatabaseQueue';
import QuizController from '../controllers/quiz-controller/quizController';
import PhaseQueue from '../queue/PhaseQueue';
import QuizManager from '../sockets/QuizManager';
import Redis from 'ioredis';
import { env } from '../configs/env';
import QuizSettings from '../class/quizSettings';
import Agent from '../gen/agents/Agent';
import EmailServiceQueue from './email/email.services';

export let redisCacheInstance: RedisCache;
export let databaseQueueInstance: DatabaseQueue;
export let quizControllerInstance: QuizController;
export let phaseQueueInstance: PhaseQueue;
export let quizManagerInstance: QuizManager;
export let quizSettingInstance: QuizSettings;
export let email_service_queue_instance: EmailServiceQueue;
export let publisherInstance: Redis;
export let subscriberInstance: Redis;

export let agent: Agent;

export default function initServices() {
    publisherInstance = new Redis(env.SERVER_REDIS_URL);
    subscriberInstance = new Redis(env.SERVER_REDIS_URL);
    redisCacheInstance = new RedisCache();
    email_service_queue_instance = new EmailServiceQueue('email-service-queue');
    databaseQueueInstance = new DatabaseQueue();
    quizControllerInstance = new QuizController();

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

    agent = new Agent();
}
