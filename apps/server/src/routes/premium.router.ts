import { Router } from 'express';
import createCheckoutController from '../controllers/premium-controller/createCheckoutController';
import getTiersController from '../controllers/premium-controller/getTiersController';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/premium/tiers', getTiersController);
router.post('/premium/create-checkout-session', authMiddleware, createCheckoutController);

export default router;
