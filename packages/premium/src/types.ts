import { SubscriptionEnum } from "@nocturn/types";
import { LIMIT_TYPE } from "./enums";

export const ONE_MINUTE = 60_000;
export const ONE_DAY = 86_400_000;

export interface NumericLimitType {
    type: LIMIT_TYPE.NUMERIC;
    value: number | null;
} // null = unlimited
export interface BooleanLimitType {
    type: LIMIT_TYPE.BOOLEAN;
    enabled: boolean;
}
export interface RateLimitType {
    type: LIMIT_TYPE.RATE;
    limit: number | null;
    windowMs: number;
}

export type LimitDefinition = NumericLimitType | BooleanLimitType | RateLimitType;

// feature defination
type FeatureDefinition<T extends LimitDefinition> = { [K in SubscriptionEnum]: T };

// feature builders
export const numeric = (
    free: number | null,
    pro: number | null,
): FeatureDefinition<NumericLimitType> => ({
    [SubscriptionEnum.FREE]: { type: LIMIT_TYPE.NUMERIC, value: free },
    [SubscriptionEnum.PRO]: { type: LIMIT_TYPE.NUMERIC, value: pro },
});

export const gate = (free: boolean, pro: boolean): FeatureDefinition<BooleanLimitType> => ({
    [SubscriptionEnum.FREE]: { type: LIMIT_TYPE.BOOLEAN, enabled: free },
    [SubscriptionEnum.PRO]: { type: LIMIT_TYPE.BOOLEAN, enabled: pro },
});

export const rate = (
    windowMs: number,
    free: number | null,
    pro: number | null,
): FeatureDefinition<RateLimitType> => ({
    [SubscriptionEnum.FREE]: { type: LIMIT_TYPE.RATE, limit: free, windowMs },
    [SubscriptionEnum.PRO]: { type: LIMIT_TYPE.RATE, limit: pro, windowMs },
});
