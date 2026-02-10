import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import { SigninController } from '../controllers/user-controller/signInController';

// <---------------------- AUTH-ROUTES ---------------------->
router.post('/sign-in', SigninController.oauthSignIn);
router.post('/send-otp', SigninController.sendOtp);
router.post('/verify-otp', SigninController.verifyOtp);

export default router;
