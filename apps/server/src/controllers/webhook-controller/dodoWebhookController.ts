import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { dodo_webhook_service } from '../../services/init.services';

export default async function dodoWebhookController(req: Request, res: Response) {
    try {
        if (!req.webhookEvent) {
            ResponseWriter.error(res, 'INVALID_WEBHOOK', 'Webhook event not found');
            return;
        }

        const webhookEvent = req.webhookEvent;
        const webhookId = req.headers['webhook-id'] as string;

        const existingWebhook = await prisma.webhookEvent.findUnique({
            where: { eventId: webhookId },
        });

        if (existingWebhook) {
            if (existingWebhook.status === 'PROCESSED') {
                ResponseWriter.success(res, { received: true, status: 'already_processed' });
                return;
            } else if (existingWebhook.status === 'PENDING') {
                ResponseWriter.success(res, { received: true, status: 'processing' });
                return;
            } else if (existingWebhook.status === 'FAILED') {
                await prisma.webhookEvent.update({
                    where: { eventId: webhookId },
                    data: {
                        status: 'PENDING',
                        retryCount: { increment: 1 },
                    },
                });
            }
        } else {
            await prisma.webhookEvent.create({
                data: {
                    provider: 'dodo_payments',
                    eventType: webhookEvent.type,
                    eventId: webhookId,
                    payload: webhookEvent as any,
                    signature: req.headers['webhook-signature'] as string,
                    status: 'PENDING',
                },
            });
        }

        try {
            await dodo_webhook_service.processWebhookEvent(webhookId);
            ResponseWriter.success(res, { received: true, status: 'processed' });
        } catch (processingError) {
            console.error('Webhook processing failed:', processingError);
            await prisma.webhookEvent.update({
                where: { eventId: webhookId },
                data: {
                    status: 'FAILED',
                    failureReason:
                        processingError instanceof Error
                            ? processingError.message
                            : 'Unknown error',
                },
            });
            ResponseWriter.success(res, { received: true, status: 'failed' });
        }
    } catch (err) {
        console.error('Webhook controller error:', err);
        ResponseWriter.success(res, { received: true, status: 'error' });
        return;
    }
}
