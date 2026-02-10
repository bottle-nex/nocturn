import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import { SigninController } from '../controllers/user-controller/signInController';

// <---------------------- AUTH-ROUTES ---------------------->
router.post('/sign-in', SigninController.oauth_signin);
router.post('/send-otp', SigninController.send_otp);
router.post('/verify-otp', SigninController.verify_otp);

export default router;
