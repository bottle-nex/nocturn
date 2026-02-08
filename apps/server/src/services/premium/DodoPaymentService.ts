import { env } from '../../configs/env';
import DodoPayments from 'dodopayments';

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

        return {
            checkoutUrl: session.checkout_url || '',
            sessionId: session.session_id,
        };
    }
}
