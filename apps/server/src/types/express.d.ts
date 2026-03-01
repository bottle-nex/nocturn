import { SubscriptionEnum } from '@nocturn/types';
import { DodoWebhookEvent } from './webhook-types';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    subscription: SubscriptionEnum;
}

declare global {
    namespace Express {
        interface Request {
            user: AuthUser;
            webhookEvent?: DodoWebhookEvent;
        }
    }
}
