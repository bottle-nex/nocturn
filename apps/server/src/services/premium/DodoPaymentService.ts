import { env } from '../../configs/env';

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
    private producction_base_url: string = 'https://api.dodopayments.com/v1';
    private test_base_url: string = 'https://api-test.dodopayments.com/v1';
    private env: 'test' | 'production';

    constructor(env: 'test' | 'production') {
        this.env = env;
        env === 'production' ? this.producction_base_url : this.test_base_url;
    }

    public async create_checkout_link(params: CreateCheckoutParams) {
        const response = await this.make_request<{ url: string; id: string }>(
            'POST',
            '/checkout/sessions',
            {
                user_id: params.userId,
                tier_id: params.tierId,
                product_id: params.productId,
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
                customer_email: params.customerEmail,
            },
        );
        return {
            checkoutUrl: response.url,
            sessionId: response.id,
        } as CheckoutResponse;
    }

    public async make_request<T>(
        method: 'GET' | 'POST' | 'DELETE',
        endpoint: string,
        data?: Record<string, unknown>,
    ): Promise<T> {
        const base_url = this.env === 'production' ? this.producction_base_url : this.test_base_url;
        const url = `${base_url}${endpoint}`;

        const headers: Record<string, string> = {
            Authorization: `Bearer ${env.SERVER_DODO_API_KEY}`,
            'Content-Type': 'application/json',
        };

        const options: {
            method: string;
            headers: Record<string, string>;
            body?: string;
        } = {
            method,
            headers,
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Dodo API error`);
        }
        return response.json() as Promise<T>;
    }
}
