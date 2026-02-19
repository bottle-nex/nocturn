import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import generateNewQuizController from '../controllers/ai-controller/generateNewQuizController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/auth.middleware';

// <---------------------- AI-ROUTES ---------------------->
router.post('/ai/generate-new-quiz', authMiddleware, generateNewQuizController);

export default router;
