import { SubscriptionEnum } from "@nocturn/types";
import { gate, numeric, ONE_DAY, ONE_MINUTE, rate } from "./types";


export const FEATURES = {
    // ── Quiz management ──────────────────────────────────────
    maxQuizzesPerUser: numeric(5, null),  // pro = unlimited
    maxQuestionsPerQuiz: numeric(15, null),
    maxPlayersPerSession: numeric(30, 500),
    maxActiveSessions: numeric(1, 10),

    // ── Media & customisation ────────────────────────────────
    imageQuestionsEnabled: gate(false, true),
    customBrandingEnabled: gate(false, true),
    exportResultsEnabled: gate(false, true),

    // ── Real-time / WS ───────────────────────────────────────
    realtimeLeaderboard: gate(true, true),
    liveAnalytics: gate(false, true),
    webhooksEnabled: gate(false, true),

    // ── Rate limits ──────────────────────────────────────────
    sessionStartsPerDay: rate(ONE_DAY, 3, null),  // pro = unlimited
    apiRequestsPerMinute: rate(ONE_MINUTE, 30, 300),
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type FeatureLimit = (typeof FEATURES)[FeatureKey][SubscriptionEnum];
