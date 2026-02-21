import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import { SigninController } from '../controllers/user-controller/signInController';
import upsertLearningJourneyController from '../controllers/user-controller/upsertLearningJourneyController';
import getLearningJourneyController from '../controllers/user-controller/getLearningJourneyController';
import authMiddleware from '../middlewares/auth.middleware';

// <---------------------- AUTH-ROUTES ---------------------->
router.post('/sign-in', SigninController.oauth_signin);
router.post('/send-otp', SigninController.send_otp);
router.post('/verify-otp', SigninController.verify_otp);
router.post('/learning-journey', authMiddleware, upsertLearningJourneyController);
router.get('/learning-journey', authMiddleware, getLearningJourneyController);

export default router;
