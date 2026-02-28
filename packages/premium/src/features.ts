import { SubscriptionEnum } from "@nocturn/types";
import { gate, numeric, ONE_DAY, ONE_MINUTE, rate } from "./types";

export const FEATURES = {
  maxParticipantPerSession: numeric(10, null),
  maxSpectatorPerSession: numeric(0, 50),

  imageQuestionsEnabled: gate(true, true),

  sessionsPerDay: rate(ONE_DAY, 3, null), // pro = unlimited
  // apiRequestsPerMinute: rate(ONE_MINUTE, 30, 300),
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type FeatureLimit = (typeof FEATURES)[FeatureKey][SubscriptionEnum];
