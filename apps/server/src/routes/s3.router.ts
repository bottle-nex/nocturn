import { Router } from 'express';
const router: Router = Router();

// <---------------------- CONTROLLERS ---------------------->
import getPreSignedUrlController from '../controllers/s3-controller/getPreSignedUrlController';

// <---------------------- S3-ROUTES ---------------------->
router.post('/get-presigned-url', getPreSignedUrlController);

export default router;
