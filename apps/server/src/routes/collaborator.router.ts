import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import Collaborator from '../controllers/collaborator-controller/join_collaborator_controller';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/authMiddleware';

// <---------------------- COLLABORATOR-ROUTES ---------------------->
router.post('/quiz/invite-collaborator/:quizId', authMiddleware, Collaborator.process);

export default router;
