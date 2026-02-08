import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function verifySessionController(req: Request, res: Response) {
    try {
        const { session_id, subscription_id } = req.query;

        // Accept either session_id (for backwards compatibility) or subscription_id (what Dodo actually provides)
        if (!session_id && !subscription_id) {
            ResponseWriter.invalid_data(res, 'session_id or subscription_id is required');
            return;
        }

        if (
            (session_id && typeof session_id !== 'string') ||
            (subscription_id && typeof subscription_id !== 'string')
        ) {
            ResponseWriter.invalid_data(res, 'Invalid parameter type');
            return;
        }

        let checkoutSession: any = null;

        if (subscription_id && typeof subscription_id === 'string') {
            // Look up by Dodo subscription ID
            // First try to find the UserSubscription
            const userSubscription = await prisma.userSubscription.findUnique({
                where: { dodoSubscriptionId: subscription_id },
                include: {
                    tier: true,
                    checkoutSession: true,
                },
            });

            if (userSubscription?.checkoutSession) {
                // Found subscription with linked checkout session
                checkoutSession = {
                    ...userSubscription.checkoutSession,
                    subscription: userSubscription,
                    tier: userSubscription.tier,
                };
            } else if (userSubscription) {
                // Subscription exists but no checkout session linked (edge case)
                // Return the subscription directly as completed
                ResponseWriter.success(res, {
                    status: 'COMPLETED',
                    subscription: {
                        id: userSubscription.id,
                        tierName: userSubscription.tier.name,
                        tierDisplayName: userSubscription.tier.displayName,
                        status: userSubscription.status,
                        currentPeriodEnd: userSubscription.currentPeriodEnd,
                    },
                    tier: {
                        name: userSubscription.tier.name,
                        displayName: userSubscription.tier.displayName,
                    },
                });
                return;
            } else {
                // Subscription not found yet - webhook hasn't fired
                // Return pending status
                ResponseWriter.success(res, {
                    status: 'PENDING',
                    subscription: null,
                    message: 'Payment is being processed. Please wait...',
                });
                return;
            }
        } else if (session_id && typeof session_id === 'string') {
            // Original flow - look up by Dodo session ID
            checkoutSession = await prisma.checkoutSession.findUnique({
                where: { dodoSessionId: session_id },
                include: {
                    subscription: {
                        include: {
                            tier: true,
                        },
                    },
                    tier: true,
                },
            });

            if (!checkoutSession) {
                ResponseWriter.not_found(res, 'Checkout session not found');
                return;
            }
        }

        if (!checkoutSession) {
            ResponseWriter.not_found(res, 'Session not found');
            return;
        }

        // Check if session is expired
        if (checkoutSession.status === 'PENDING' && checkoutSession.expiresAt < new Date()) {
            await prisma.checkoutSession.update({
                where: { id: checkoutSession.id },
                data: { status: 'EXPIRED' },
            });

            ResponseWriter.success(res, {
                status: 'EXPIRED',
                message: 'This checkout session has expired',
            });
            return;
        }

        // Return session status and subscription if completed
        ResponseWriter.success(res, {
            status: checkoutSession.status,
            subscription: checkoutSession.subscription
                ? {
                      id: checkoutSession.subscription.id,
                      tierName: checkoutSession.subscription.tier.name,
                      tierDisplayName: checkoutSession.subscription.tier.displayName,
                      status: checkoutSession.subscription.status,
                      currentPeriodEnd: checkoutSession.subscription.currentPeriodEnd,
                  }
                : null,
            tier: {
                name: checkoutSession.tier.name,
                displayName: checkoutSession.tier.displayName,
            },
        });
    } catch (err) {
        console.error('Failed to verify session:', err);
        ResponseWriter.system_error(res);
    }
}
