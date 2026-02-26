import { SubscriptionEnum } from "@nocturn/types";

export const ONE_MINUTE = 60_000;
export const ONE_DAY = 86_400_000;

// shape limits
export interface NumericDef { type: "numeric"; value: number | null }  // null = unlimited
export interface BooleanDef { type: "boolean"; enabled: boolean }
export interface RateDef { type: "rate"; limit: number | null; windowMs: number }

export type LimitDef = NumericDef | BooleanDef | RateDef;

// feature defination
type FeatureDef<T extends LimitDef> = { [K in SubscriptionEnum]: T };

// feature builders
export const numeric = (
    free: number | null,
    pro: number | null
): FeatureDef<NumericDef> => ({
    [SubscriptionEnum.FREE]: { type: "numeric", value: free },
    [SubscriptionEnum.PRO]: { type: "numeric", value: pro },
});

export const gate = (
    free: boolean,
    pro: boolean
): FeatureDef<BooleanDef> => ({
    [SubscriptionEnum.FREE]: { type: "boolean", enabled: free },
    [SubscriptionEnum.PRO]: { type: "boolean", enabled: pro },
});

export const rate = (
    windowMs: number,
    free: number | null,
    pro: number | null
): FeatureDef<RateDef> => ({
    [SubscriptionEnum.FREE]: { type: "rate", limit: free, windowMs },
    [SubscriptionEnum.PRO]: { type: "rate", limit: pro, windowMs },
});