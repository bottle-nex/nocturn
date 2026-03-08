import { SubscriptionEnum } from "@nocturn/types";
import { FeatureLimit, FEATURES } from "./features";
import { FEATURE, LIMIT_TYPE } from "./enums";

class PlanManager {
<<<<<<< HEAD
  getLimit<K extends FEATURE>(tier: SubscriptionEnum, feature: K) {
    return FEATURES[feature][tier];
  }

  isEnabled(tier: SubscriptionEnum, feature: FEATURE): boolean {
    const limit = FEATURES[feature][tier];
    switch (limit.type) {
      case LIMIT_TYPE.BOOLEAN:
        return limit.enabled;
      case LIMIT_TYPE.NUMERIC:
        return limit.value === null || limit.value > 0;
      case LIMIT_TYPE.RATE:
        return limit.limit === null || limit.limit > 0;
=======
    /** Raw limit object for a feature on a given tier */
    getLimit<K extends FeatureKey>(tier: SubscriptionEnum, feature: K) {
        return FEATURES[feature][tier];
>>>>>>> e748f536 (added: full flow for the quiz end screens)
    }

<<<<<<< HEAD
  getNumericLimit(tier: SubscriptionEnum, feature: FEATURE): number | null {
    const limit = FEATURES[feature][tier];
    if (limit.type !== LIMIT_TYPE.NUMERIC)
      throw new Error(`"${feature}" is not a numeric limit.`);
    return limit.value;
  }

  getRateLimit(
    tier: SubscriptionEnum,
    feature: FEATURE,
  ): { limit: number | null; windowMs: number } {
    const limit = FEATURES[feature][tier];
    if (limit.type !== LIMIT_TYPE.RATE)
      throw new Error(`"${feature}" is not a rate limit.`);
    return { limit: limit.limit, windowMs: limit.windowMs };
  }

  getPlan(tier: SubscriptionEnum): Record<FEATURE, FeatureLimit> {
    const plan: Record<FEATURE, FeatureLimit> = {} as Record<
      FEATURE,
      FeatureLimit
    >;
    Object.entries(FEATURES).forEach(([key, def]) => {
      plan[key as FEATURE] = def[tier];
    });
    return plan;
  }
=======
    /** Is this feature accessible at all for the tier? */
    isEnabled(tier: SubscriptionEnum, feature: FeatureKey): boolean {
        const limit = FEATURES[feature][tier];
        switch (limit.type) {
            case "boolean":
                return limit.enabled;
            case "numeric":
                return limit.value === null || limit.value > 0;
            case "rate":
                return limit.limit === null || limit.limit > 0;
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
    getRateLimit(
        tier: SubscriptionEnum,
        feature: FeatureKey,
    ): { limit: number | null; windowMs: number } {
        const limit = FEATURES[feature][tier];
        if (limit.type !== "rate")
            throw new Error(`"${feature}" is not a rate limit.`);
        return { limit: limit.limit, windowMs: limit.windowMs };
    }

    /** Full feature map for a tier — useful for seeding context */
    getPlan(tier: SubscriptionEnum): Record<FeatureKey, FeatureLimit> {
        const plan: Record<FeatureKey, FeatureLimit> = {} as Record<
            FeatureKey,
            FeatureLimit
        >;
        Object.entries(FEATURES).forEach(([key, def]) => {
            plan[key as FeatureKey] = def[tier];
        });
        return plan;
    }
>>>>>>> e748f536 (added: full flow for the quiz end screens)
}

export const planManager = new PlanManager();
