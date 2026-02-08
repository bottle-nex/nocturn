import { Router } from 'express';
import express from 'express';
import dodoWebhookController from '../controllers/webhook-controller/dodoWebhookController';
import webhookVerificationMiddleware from '../middlewares/webhookVerificationMiddleware';

const router: Router = Router();

router.post(
    '/webhooks/dodo-payments',
    express.raw({ type: 'application/json' }),
    webhookVerificationMiddleware,
    dodoWebhookController,
);

export default router;
