'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';
import { SubscriptionEnum } from '@nocturn/types';
import { planManager as Plans, type FeatureKey } from '@nocturn/premium';

export interface SubscriptionContextValue {
    tier: SubscriptionEnum;
    isLoaded: boolean;

    setTier: (tier: SubscriptionEnum) => void;
    isEnabled: (feature: FeatureKey) => boolean;
    getNumericLimit: (feature: FeatureKey) => number | null;
    getRateLimit: (feature: FeatureKey) => { limit: number | null; windowMs: number };
    isPro: () => boolean;
}

export const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

interface SubscriptionProviderProps {
    children: ReactNode;
    initialTier?: SubscriptionEnum;
}

export default function SubscriptionProvider({ children, initialTier }: SubscriptionProviderProps) {
    const [tier, setTierState] = useState<SubscriptionEnum>(initialTier ?? SubscriptionEnum.FREE);
    const [isLoaded, setIsLoaded] = useState(!!initialTier);

    const setTier = useCallback((newTier: SubscriptionEnum) => {
        setTierState(newTier);
        setIsLoaded(true);
    }, []);

    const isEnabled = useCallback((feature: FeatureKey) => Plans.isEnabled(tier, feature), [tier]);

    const getNumericLimit = useCallback(
        (feature: FeatureKey) => Plans.getNumericLimit(tier, feature),
        [tier],
    );

    const getRateLimit = useCallback(
        (feature: FeatureKey) => Plans.getRateLimit(tier, feature),
        [tier],
    );

    const isPro = useCallback(() => tier === SubscriptionEnum.PRO, [tier]);

    return (
        <SubscriptionContext.Provider
            value={{ tier, isLoaded, setTier, isEnabled, getNumericLimit, getRateLimit, isPro }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}
