import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import getPreSignedUrlController from '../controllers/s3-controller/getPreSignedUrlController';

import authMiddleware from '../middlewares/auth.middleware';

// <---------------------- S3-ROUTES ---------------------->
router.post('/get-presigned-url', authMiddleware, getPreSignedUrlController);

export default router;
