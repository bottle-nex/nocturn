export interface DodoWebhookEvent {
    business_id: string;
    type: WebhookEventType;
    timestamp: string;
    data: {
        id?: string;
        payment_id?: string;
        subscription_id?: string;
        amount?: number;
        total_amount?: number;
        currency?: string;
        customer_id?: string;
        current_period_start?: number;
        current_period_end?: number;
        billing_interval?: 'monthly' | 'yearly';
        cancel_at?: number;
        status?: string;
        metadata?: {
            user_id?: string;
            tier_id?: string;
        };
        [key: string]: any;
    };
}

export type WebhookEventType =
    | 'payment.succeeded'
    | 'payment.failed'
    | 'subscription.active'
    | 'subscription.cancelled'
    | 'subscription.expired'
    | 'subscription.renewed'
    | 'subscription.paused'
    | 'subscription.resumed'
    | 'subscription.past_due';
