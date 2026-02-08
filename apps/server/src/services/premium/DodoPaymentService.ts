import { env } from '../../configs/env';
import DodoPayments from 'dodopayments';
import { prisma } from '@nocturn/database';

interface CreateCheckoutParams {
    userId: string;
    tierId: string;
    productId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
}

interface CheckoutResponse {
    checkoutUrl: string;
    sessionId: string;
    checkoutSessionId: string; // Our internal DB ID
}

export default class DodoPaymentService {
    public client: DodoPayments;

    constructor(environment: 'test' | 'production') {
        this.client = new DodoPayments({
            bearerToken: env.SERVER_DODO_API_KEY,
            environment: environment === 'production' ? 'live_mode' : 'test_mode',
        });
    }

    public async create_checkout_link(params: CreateCheckoutParams): Promise<CheckoutResponse> {
        const session = await this.client.checkoutSessions.create({
            product_cart: [
                {
                    product_id: params.productId,
                    quantity: 1,
                },
            ],
            return_url: params.successUrl,
            metadata: {
                user_id: params.userId,
                tier_id: params.tierId,
            },
        });

        // Store checkout session in database
        const checkoutSession = await prisma.checkoutSession.create({
            data: {
                dodoSessionId: session.session_id,
                checkoutUrl: session.checkout_url || '',
                userId: params.userId,
                tierId: params.tierId,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
                metadata: {
                    productId: params.productId,
                    customerEmail: params.customerEmail,
                },
            },
        });

        return {
            checkoutUrl: session.checkout_url || '',
            sessionId: session.session_id,
            checkoutSessionId: checkoutSession.id,
        };
    }
}
