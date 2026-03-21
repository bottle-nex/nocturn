import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import generateNewQuizController from '../controllers/ai-controller/generateNewQuizController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/auth.middleware';
import acceptOrDeclineQuiz from '../controllers/ai-controller/acceptOrDeclineQuiz';
import getLastAIChatController from '../controllers/ai-controller/getLastAIChatController';

// <---------------------- AI-ROUTES ---------------------->
router.post('/ai/generate-new-quiz', authMiddleware, generateNewQuizController);
router.post('/ai/accept-or-decline-generated-quiz', authMiddleware, acceptOrDeclineQuiz);
router.get('/ai/get-last-ai-chat', authMiddleware, getLastAIChatController);

export default router;
