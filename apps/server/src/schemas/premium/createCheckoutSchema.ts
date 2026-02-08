import { BILLING_INTERVAL } from '@nocturn/types';
import z from 'zod';

export const createCheckoutSchema = z.object({
    tierId: z.string().min(1, 'Tier ID is required'),
    billingInterval: z.enum([BILLING_INTERVAL.MONTH, BILLING_INTERVAL.YEAR]),
});
