'use client';

import { SubscriptionContext, SubscriptionContextValue } from '@/providers/SubscriptionProvider';
import { useContext } from 'react';

export function useSubscription(): SubscriptionContextValue {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) {
        throw new Error('usePlan() must be used inside <PlanProvider>');
    }
    return ctx;
}