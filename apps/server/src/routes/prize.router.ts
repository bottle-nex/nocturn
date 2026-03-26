import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import setDistributionController from '../controllers/prize-controller/setDistributionController';
import confirmStakeController from '../controllers/prize-controller/confirmStakeController';
import authorizeConfirmController from '../controllers/prize-controller/authorizeConfirmController';
import getPrizeClaimsController from '../controllers/prize-controller/getPrizeClaimsController';
import getClaimController from '../controllers/prize-controller/getClaimController';
import confirmClaimController from '../controllers/prize-controller/confirmClaimController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/auth.middleware';

// <---------------------- AUTHENTICATED ROUTES ---------------------->
router.post('/prize/distribution/:quizId', authMiddleware, setDistributionController);
router.post('/prize/confirm-stake/:quizId', authMiddleware, confirmStakeController);
router.post('/prize/authorize-confirm/:quizId', authMiddleware, authorizeConfirmController);
router.get('/prize/claims/:quizId', authMiddleware, getPrizeClaimsController);

// <---------------------- PUBLIC ROUTES (no auth - claim page) ---------------------->
router.get('/prize/claim/:token', getClaimController);
router.post('/prize/claim/:token/confirm', confirmClaimController);

export default router;
