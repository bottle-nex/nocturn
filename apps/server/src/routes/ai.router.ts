import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import generateNewQuizController from '../controllers/ai-controller/generateNewQuizController';

// <---------------------- MIDDLEWARES ---------------------->
import { FEATURE } from '@nocturn/premium';
import Subscription from '../middlewares/subscription.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import acceptOrDeclineQuiz from '../controllers/ai-controller/acceptOrDeclineQuiz';
import getLastAIChatController from '../controllers/ai-controller/getLastAIChatController';

// <---------------------- AI-ROUTES ---------------------->
router.post(
    '/ai/generate-new-quiz',
    authMiddleware,
    Subscription.checkUsageLimit(FEATURE.AI_GENERATION),
    generateNewQuizController,
);
router.get('/ai/usage', authMiddleware, Subscription.ai_usage);
router.post('/ai/accept-or-decline-generated-quiz', authMiddleware, acceptOrDeclineQuiz);
router.get('/ai/get-last-ai-chat', authMiddleware, getLastAIChatController);

export default router;
