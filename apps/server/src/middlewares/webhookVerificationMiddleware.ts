import { NextFunction, Request, Response } from 'express';
import { env } from '../configs/env';
import { dodo_payment_service } from '../services/init.services';
import { DodoWebhookEvent } from '../types/webhook-types';

export default async function webhookVerificationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const webhookId = req.headers['webhook-id'] as string;
        const webhookTimestamp = req.headers['webhook-timestamp'] as string;
        const webhookSignature = req.headers['webhook-signature'] as string;

        console.log('Webhook headers:', {
            'webhook-id': webhookId,
            'webhook-timestamp': webhookTimestamp,
            'webhook-signature': webhookSignature ? 'present' : 'missing',
        });

        if (!webhookId || !webhookTimestamp || !webhookSignature) {
            res.status(401).json({ message: 'Missing webhook headers' });
            return;
        }

        if (!env.SERVER_DODO_WEBHOOK_SECRET) {
            console.error('SERVER_DODO_WEBHOOK_SECRET not configured');
            res.status(500).json({ message: 'Webhook secret not configured' });
            return;
        }

        const rawBody = Buffer.isBuffer(req.body)
            ? req.body.toString('utf8')
            : JSON.stringify(req.body);

        const event = dodo_payment_service.client.webhooks.unwrap(rawBody, {
            headers: {
                'webhook-id': webhookId,
                'webhook-timestamp': webhookTimestamp,
                'webhook-signature': webhookSignature,
            },
            key: env.SERVER_DODO_WEBHOOK_SECRET,
        });

        req.webhookEvent = event as unknown as DodoWebhookEvent;
        next();
    } catch (error) {
        console.error('Webhook verification failed:', error);
        res.status(401).json({ message: 'Invalid webhook signature' });
        return;
    }
}
