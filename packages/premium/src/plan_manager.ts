import { SubscriptionEnum } from "@nocturn/types";
import { FeatureLimit, FEATURES } from "./features";
import { FEATURE, LIMIT_TYPE } from "./enums";

class PlanManager {
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
    }
  }

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
}

export const planManager = new PlanManager();
