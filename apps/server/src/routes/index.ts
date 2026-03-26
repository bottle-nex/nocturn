import { Router } from 'express';
const router: Router = Router();

// <---------------------- ROUTE-MODULES ---------------------->
import authRoutes from './auth.router';
import reviewRoutes from './review.router';
import quizRoutes from './quiz.router';
import liveQuizRoutes from './live-quiz.router';
import collaboratorRoutes from './collaborator.router';
import aiRoutes from './ai.router';
import s3Routes from './s3.router';
import premiumRoutes from './premium.router';
import webhookRoutes from './webhook.router';
import prizeRoutes from './prize.router';

// <---------------------- REGISTER-ROUTES ---------------------->
router.use('/', authRoutes);
router.use('/', reviewRoutes);
router.use('/', quizRoutes);
router.use('/', liveQuizRoutes);
router.use('/', collaboratorRoutes);
router.use('/', aiRoutes);
router.use('/', s3Routes);
router.use('/', premiumRoutes);
router.use('/', webhookRoutes);
router.use('/', prizeRoutes);

export default router;
