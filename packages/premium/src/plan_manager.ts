import { SubscriptionEnum } from "@nocturn/types";
import { FeatureKey, FEATURES } from "./features";

class PlanManager {
    /** Raw limit object for a feature on a given tier */
    getLimit<K extends FeatureKey>(tier: SubscriptionEnum, feature: K) {
        return FEATURES[feature][tier];
    }

    /** Is this feature accessible at all for the tier? */
    isEnabled(tier: SubscriptionEnum, feature: FeatureKey): boolean {
        const limit = FEATURES[feature][tier];
        switch (limit.type) {
            case "boolean": return limit.enabled;
            case "numeric": return limit.value === null || limit.value > 0;
            case "rate": return limit.limit === null || limit.limit > 0;
        }
    }

    /** Numeric ceiling, or null for unlimited. Throws on wrong type. */
    getNumericLimit(tier: SubscriptionEnum, feature: FeatureKey): number | null {
        const limit = FEATURES[feature][tier];
        if (limit.type !== "numeric")
            throw new Error(`"${feature}" is not a numeric limit.`);
        return limit.value;
    }

    /** Rate limit details. Throws on wrong type. */
    getRateLimit(tier: SubscriptionEnum, feature: FeatureKey): { limit: number | null; windowMs: number } {
        const limit = FEATURES[feature][tier];
        if (limit.type !== "rate")
            throw new Error(`"${feature}" is not a rate limit.`);
        return { limit: limit.limit, windowMs: limit.windowMs };
    }

    /** Full feature map for a tier — useful for seeding context */
    getPlan(tier: SubscriptionEnum): Record<FeatureKey, FeatureLimit> {
        return Object.fromEntries(
            Object.entries(FEATURES).map(([key, def]) => [key, def[tier]])
        ) as Record<FeatureKey, FeatureLimit>;
    }
}

export const Plans = new PlanManager();
