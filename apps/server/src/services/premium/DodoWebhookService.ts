import { prisma } from '@nocturn/database';
import { DodoWebhookEvent } from '../../types/webhook-types';
import chalk from 'chalk';

export default class DodoWebhookService {
    public async processWebhookEvent(eventId: string): Promise<void> {
        const webhookEvent = await prisma.webhookEvent.findUnique({
            where: { eventId },
        });

        if (!webhookEvent) {
            throw new Error(`Webhook event not found: ${eventId}`);
        }

        const event = webhookEvent.payload as unknown as DodoWebhookEvent;
        console.log(`Processing webhook event: ${event.type} (${eventId})`);
        console.log('event is :::::::::::::::::::::::::::::::::::: ', event);

        switch (event.type) {
            case 'payment.succeeded':
                await this.handlePaymentSucceeded(event, eventId);
                break;
            case 'payment.failed':
                await this.handlePaymentFailed(event, eventId);
                break;
            case 'subscription.active':
                await this.handleSubscriptionActive(event, eventId);
                break;
            case 'subscription.cancelled':
                await this.handleSubscriptionCancelled(event, eventId);
                break;
            case 'subscription.expired':
                await this.handleSubscriptionExpired(event, eventId);
                break;
            case 'subscription.renewed':
                await this.handleSubscriptionRenewed(event, eventId);
                break;
            case 'subscription.past_due':
                await this.handleSubscriptionPastDue(event, eventId);
                break;
            default:
                console.log(`Unhandled webhook event type: ${event.type}`);
                await prisma.webhookEvent.update({
                    where: { eventId },
                    data: {
                        status: 'SKIPPED',
                        processedAt: new Date(),
                        failureReason: `Unhandled event type: ${event.type}`,
                    },
                });
        }
    }

    private async handlePaymentSucceeded(event: DodoWebhookEvent, eventId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const userId = event.data.metadata?.user_id;
            if (!userId) {
                throw new Error('Missing user_id in payment metadata');
            }

            const paymentId = (event.data.payment_id || event.data.id) as string;
            const amount = event.data.total_amount || event.data.amount || 0;

            let subscriptionId: string | undefined;
            if (event.data.subscription_id) {
                const subscription = await tx.userSubscription.findUnique({
                    where: { dodoSubscriptionId: event.data.subscription_id },
                });
                subscriptionId = subscription?.id;
            }

            await tx.payment.upsert({
                where: { dodoPaymentId: paymentId },
                update: {
                    status: 'SUCCESS',
                    paidAt: new Date(),
                    amount: amount,
                    currency: event.data.currency || 'INR',
                },
                create: {
                    dodoPaymentId: paymentId,
                    userId: userId,
                    amount: amount,
                    currency: event.data.currency || 'INR',
                    status: 'SUCCESS',
                    paidAt: new Date(),
                    subscriptionId: subscriptionId,
                },
            });

            if (event.data.subscription_id && subscriptionId) {
                const subscription = await tx.userSubscription.update({
                    where: { dodoSubscriptionId: event.data.subscription_id },
                    data: { status: 'ACTIVE' },
                    include: { tier: true },
                });

                await tx.user.update({
                    where: { id: subscription.userId },
                    data: {
                        currentTier: subscription.tier.name,
                        isTrialing: false,
                    },
                });
            }

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handlePaymentFailed(event: DodoWebhookEvent, eventId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const userId = event.data.metadata?.user_id;
            if (!userId) {
                throw new Error('Missing user_id in payment metadata');
            }

            const paymentId = (event.data.payment_id || event.data.id) as string;
            const amount = event.data.total_amount || event.data.amount || 0;

            await tx.payment.upsert({
                where: { dodoPaymentId: paymentId },
                update: {
                    status: 'FAILED',
                    failedAt: new Date(),
                },
                create: {
                    dodoPaymentId: paymentId,
                    userId: userId,
                    amount: amount,
                    currency: event.data.currency || 'INR',
                    status: 'FAILED',
                    failedAt: new Date(),
                },
            });

            if (event.data.subscription_id) {
                const subscription = await tx.userSubscription.findUnique({
                    where: { dodoSubscriptionId: event.data.subscription_id },
                });

                if (subscription) {
                    await tx.userSubscription.update({
                        where: { dodoSubscriptionId: event.data.subscription_id },
                        data: { status: 'PAST_DUE' },
                    });
                }
            }

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handleSubscriptionActive(
        event: DodoWebhookEvent,
        eventId: string,
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const tierId = event.data.metadata?.tier_id;
            const userId = event.data.metadata?.user_id;
            console.log('tierId is : ', tierId);
            console.log('userId is : ', userId);
            if (!tierId || !userId) {
                throw new Error('Missing tier_id or user_id in subscription metadata');
            }

            const tier = await tx.subscriptionTier.findUnique({
                where: { id: tierId },
            });
            console.log(chalk.red('tier found is  : ', tier));

            if (!tier) {
                throw new Error(`Tier not found: ${tierId}`);
            }

            const currentPeriodStart = event.data.current_period_start
                ? new Date(event.data.current_period_start * 1000)
                : new Date();
            const currentPeriodEnd = event.data.current_period_end
                ? new Date(event.data.current_period_end * 1000)
                : new Date();

            const subscriptionId = event.data.subscription_id;
            if (!subscriptionId) {
                throw new Error('Missing subscription_id in event data');
            }

            const subscription = await tx.userSubscription.upsert({
                where: { dodoSubscriptionId: subscriptionId },
                update: {
                    status: 'ACTIVE',
                    currentPeriodStart,
                    currentPeriodEnd,
                },
                create: {
                    dodoSubscriptionId: subscriptionId,
                    dodoCustomerId: event.data.customer_id,
                    userId: userId,
                    tierId: tierId,
                    status: 'ACTIVE',
                    billingInterval:
                        event.data.billing_interval === 'monthly' ? 'MONTHLY' : 'YEARLY',
                    currentPeriodStart,
                    currentPeriodEnd,
                    amount: event.data.amount || 0,
                    currency: event.data.currency || 'INR',
                },
            });

            console.log(chalk.blue('subscription upserted: ', subscription));

            await tx.user.update({
                where: { id: subscription.userId },
                data: {
                    currentTier: tier.name,
                    isTrialing: false,
                },
            });

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handleSubscriptionCancelled(
        event: DodoWebhookEvent,
        eventId: string,
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const subscriptionId = event.data.subscription_id || event.data.id;
            const subscription = await tx.userSubscription.findUnique({
                where: { dodoSubscriptionId: subscriptionId },
            });

            if (!subscription) {
                console.warn(`Subscription not found for cancellation: ${subscriptionId}`);
                await tx.webhookEvent.update({
                    where: { eventId },
                    data: {
                        status: 'SKIPPED',
                        processedAt: new Date(),
                        failureReason: 'Subscription not found in database',
                    },
                });
                return;
            }

            const cancelAt = event.data.cancel_at
                ? new Date(event.data.cancel_at * 1000)
                : new Date();

            await tx.userSubscription.update({
                where: { dodoSubscriptionId: subscriptionId },
                data: {
                    status: 'CANCELLED',
                    cancelAt,
                },
            });

            await tx.user.update({
                where: { id: subscription.userId },
                data: { currentTier: 'FREE' },
            });

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handleSubscriptionExpired(
        event: DodoWebhookEvent,
        eventId: string,
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const subscriptionId = event.data.subscription_id || event.data.id;
            const subscription = await tx.userSubscription.findUnique({
                where: { dodoSubscriptionId: subscriptionId },
            });

            if (!subscription) {
                console.warn(`Subscription not found for expiration: ${subscriptionId}`);
                await tx.webhookEvent.update({
                    where: { eventId },
                    data: {
                        status: 'SKIPPED',
                        processedAt: new Date(),
                        failureReason: 'Subscription not found in database',
                    },
                });
                return;
            }

            await tx.userSubscription.update({
                where: { dodoSubscriptionId: subscriptionId },
                data: { status: 'EXPIRED' },
            });

            await tx.user.update({
                where: { id: subscription.userId },
                data: { currentTier: 'FREE' },
            });

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handleSubscriptionRenewed(
        event: DodoWebhookEvent,
        eventId: string,
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const subscriptionId = event.data.subscription_id || event.data.id;
            const subscription = await tx.userSubscription.findUnique({
                where: { dodoSubscriptionId: subscriptionId },
            });

            if (!subscription) {
                console.warn(`Subscription not found for renewal: ${subscriptionId}`);
                await tx.webhookEvent.update({
                    where: { eventId },
                    data: {
                        status: 'SKIPPED',
                        processedAt: new Date(),
                        failureReason: 'Subscription not found in database',
                    },
                });
                return;
            }

            const currentPeriodStart = event.data.current_period_start
                ? new Date(event.data.current_period_start * 1000)
                : new Date();
            const currentPeriodEnd = event.data.current_period_end
                ? new Date(event.data.current_period_end * 1000)
                : new Date();

            await tx.userSubscription.update({
                where: { dodoSubscriptionId: subscriptionId },
                data: {
                    currentPeriodStart,
                    currentPeriodEnd,
                    status: 'ACTIVE',
                },
            });

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }

    private async handleSubscriptionPastDue(
        event: DodoWebhookEvent,
        eventId: string,
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const subscriptionId = event.data.subscription_id || event.data.id;
            const subscription = await tx.userSubscription.findUnique({
                where: { dodoSubscriptionId: subscriptionId },
            });

            if (!subscription) {
                console.warn(`Subscription not found for past due: ${subscriptionId}`);
                await tx.webhookEvent.update({
                    where: { eventId },
                    data: {
                        status: 'SKIPPED',
                        processedAt: new Date(),
                        failureReason: 'Subscription not found in database',
                    },
                });
                return;
            }

            await tx.userSubscription.update({
                where: { dodoSubscriptionId: subscriptionId },
                data: { status: 'PAST_DUE' },
            });

            await tx.webhookEvent.update({
                where: { eventId },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });
        });
    }
}
