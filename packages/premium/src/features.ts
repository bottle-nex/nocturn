import { SubscriptionEnum } from "@nocturn/types";
import { gate, numeric, ONE_DAY, rate } from "./types";

export const FEATURES = {
    maxParticipantPerSession: numeric(10, null),
    maxSpectatorPerSession: numeric(0, 50),
    maxCollaborators: numeric(0, 4),
    maxQuestions: numeric(20, null),

    liveChat: gate(false, true),

    sessionsPerDay: rate(ONE_DAY, 5, null), // pro = unlimited
    // apiRequestsPerMinute: rate(ONE_MINUTE, 30, 300),
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type FeatureLimit = (typeof FEATURES)[FeatureKey][SubscriptionEnum];
