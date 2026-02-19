import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import reviewAppController from '../controllers/appReview-controller/reviewAppController';
import getReviewController from '../controllers/appReview-controller/getReviewController';

// <---------------------- MIDDLEWARES ---------------------->
import authMiddleware from '../middlewares/auth.middleware';

// <---------------------- REVIEW-ROUTES ---------------------->
router.post('/user/create-review', authMiddleware, reviewAppController);
router.get('/user/get-review', authMiddleware, getReviewController);

export default router;
