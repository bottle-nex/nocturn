import { env } from '../../configs/env';
import { prisma } from '@nocturn/database';
import { Request, Response } from 'express';
import { createCheckoutSchema } from '../../schemas/premium/createCheckoutSchema';
import { dodo_payment_service } from '../../services/init.services';
import ResponseWriter from '../../class/response_writer';

const TIER_TO_PRODUCT_ID: Record<string, string | undefined> = {
    PRO: env.SERVER_DODO_PRO_PRODUCT_ID,
    ENTERPRISE: env.SERVER_DODO_ENTERPRISE_PRODUCT_ID,
};

export default async function createCheckoutController(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.id) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { data: parsed_data, success } = createCheckoutSchema.safeParse(req.body);
        if (!success) {
            ResponseWriter.invalid_data(res, 'Invalid request data');
            return;
        }

        const tier = await prisma.subscriptionTier.findUnique({
            where: {
                id: parsed_data.tierId,
            },
        });

        if (!tier) {
            ResponseWriter.not_found(res, 'Tier not found');
            return;
        }

        if (!tier.isActive) {
            ResponseWriter.error(res, 'TIER_INACTIVE', 'This tier is not active currently');
            return;
        }

        const productId = TIER_TO_PRODUCT_ID[tier.name];
        if (!productId) {
            ResponseWriter.error(res, 'INVALID_TIER', 'No product configured for this tier');
            return;
        }

        const existing_subscription = await prisma.userSubscription.findFirst({
            where: {
                userId: req.user.id,
                status: 'ACTIVE',
            },
            include: {
                tier: true,
            },
        });

        if (existing_subscription && existing_subscription.tier.name !== 'FREE') {
            ResponseWriter.success(
                res,
                { checkoutUrl: null },
                `You already have an active subscription (${existing_subscription.tier.name}).`,
            );
            return;
        }

        const frontend_url = env.SERVER_WEB_URL;
        const checkout_session_result = await dodo_payment_service.create_checkout_link({
            userId: req.user.id,
            tierId: parsed_data.tierId,
            productId,
            successUrl: `${frontend_url}/premium/success`,
            cancelUrl: `${frontend_url}/premium/cancel`,
            customerEmail: req.user.email || undefined,
        });

        ResponseWriter.success(res, { checkoutUrl: checkout_session_result.checkoutUrl });
    } catch (err) {
        console.error('Failed to create checkout:', err);
        ResponseWriter.system_error(res);
        return;
    }
}
