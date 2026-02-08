import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import signInController from '../controllers/user-controller/signInController';

// <---------------------- AUTH-ROUTES ---------------------->
router.post('/sign-in', signInController);

export default router;
