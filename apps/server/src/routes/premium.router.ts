import { Router } from 'express';
import createCheckoutController from '../controllers/premium-controller/createCheckoutController';
import getTiersController from '../controllers/premium-controller/getTiersController';
import verifySessionController from '../controllers/premium-controller/verifySessionController';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/premium/tiers', getTiersController);
router.post('/premium/create-checkout-session', authMiddleware, createCheckoutController);
router.get('/premium/verify-session', verifySessionController);

export default router;
