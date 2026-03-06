import { SubscriptionEnum } from "@nocturn/types";
import { gate, numeric, ONE_DAY, rate } from "./types";
import { FEATURE } from "./enums";

// export const FEATURES = {
//   maxParticipantPerSession: numeric(10, null),
//   maxSpectatorPerSession: numeric(10, 50),
//   maxCollaborators: numeric(0, 4),
//   maxQuestions: numeric(20, null),

//   liveChat: gate(false, true),

//   sessionsPerDay: rate(ONE_DAY, 1, null), // pro = unlimited
//   // apiRequestsPerMinute: rate(ONE_MINUTE, 30, 300),
// } as const;

// export type FeatureKey = keyof typeof FEATURES;
// export type FeatureLimit = (typeof FEATURES)[FeatureKey][SubscriptionEnum];

export const FEATURES = {
  [FEATURE.MAX_PARTICIPANTS_PER_SESSION]: numeric(10, null),
  [FEATURE.MAX_SPECTATORS_PER_SESSION]: numeric(10, 50),
  [FEATURE.MAX_COLLABORATORS_PER_SESSION]: numeric(0, 4),
  [FEATURE.MAX_SLIDES_PER_PRESENTATION]: numeric(20, null),
  [FEATURE.MAX_CONCURRENT_SESSIONS]: numeric(0, 5),
  [FEATURE.LIVE_CHAT]: gate(false, true),
  [FEATURE.SESSIONS_PER_DAY]: rate(ONE_DAY, 20, null),
};

export type FeatureLimit = (typeof FEATURES)[FEATURE][SubscriptionEnum];
