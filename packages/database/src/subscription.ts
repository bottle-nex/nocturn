import { prisma } from "./client";
import type { UserSubscription } from "../generated/client";

// A failed renewal keeps access for three days after the paid period.
export const PAYMENT_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

type SubscriptionDetails = Pick<
  UserSubscription,
  "status" | "currentPeriodEnd" | "cancelAt" | "trialEnd"
> & { tier: { name: string } };

export function resolveSubscription(
  subscription: SubscriptionDetails | null,
  now = new Date(),
) {
  if (!subscription) {
    return { tier: "FREE" as const, status: null, accessUntil: null };
  }

  let accessUntil = subscription.currentPeriodEnd;
  if (subscription.status === "PAST_DUE") {
    // Repeated failures cannot extend the grace period.
    accessUntil = new Date(accessUntil.getTime() + PAYMENT_GRACE_PERIOD_MS);
  } else if (subscription.status === "TRIALING" && subscription.trialEnd) {
    accessUntil = new Date(
      Math.min(accessUntil.getTime(), subscription.trialEnd.getTime()),
    );
  }

  const entitled = subscription.status !== "EXPIRED" && accessUntil > now;
  return {
    tier:
      entitled && subscription.tier.name === "PRO"
        ? ("PRO" as const)
        : ("FREE" as const),
    status: subscription.status,
    accessUntil,
  };
}

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      status: true,
      currentPeriodEnd: true,
      cancelAt: true,
      trialEnd: true,
      tier: { select: { name: true } },
    },
  });
  return resolveSubscription(subscription);
}
