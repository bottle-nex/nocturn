import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import Collaborator from '../controllers/collaborator-controller/join_collaborator_controller';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/auth.middleware';
import Subscription from '../middlewares/subscription.middleware';

// <---------------------- COLLABORATOR-ROUTES ---------------------->
router.post('/quiz/invite-collaborator/:quizId', authMiddleware, Subscription.collaborator_limit, Collaborator.process);

export default router;
