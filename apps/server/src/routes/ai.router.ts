import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import generateNewQuizController from '../controllers/ai-controller/generateNewQuizController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/authMiddleware';

// <---------------------- AI-ROUTES ---------------------->
router.post('/ai/generate-new-quiz', authMiddleware, generateNewQuizController);

export default router;
