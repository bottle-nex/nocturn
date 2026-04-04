import { Prisma, prisma, TemplateEnum } from "../src";
import { templates } from "../src/utils/templates";

// <---------------- SUBSCRIPTION TIERS ---------------->
async function seedSubscriptionTiers() {
  console.log("Seeding subscription tiers...");

  await prisma.subscriptionTier.createMany({
    data: [
      {
        name: "FREE",
        displayName: "Free Plan",
        description: "Perfect for getting started with quiz creation",
        priceMonthly: 0,
        priceYearly: 0,
        currency: "INR",
        maxQuizzesPerMonth: 5,
        maxAiGenerationsPerMonth: 3,
        maxCollaborators: 1,
        maxActiveQuizzes: 5,
        advancedTemplates: false,
        customBranding: false,
        prioritySupport: false,
        advancedAnalytics: false,
        isActive: true,
        sortOrder: 0,
      },
      {
        name: "PRO",
        displayName: "Pro Plan",
        description: "For professional quiz creators and educators",
        priceMonthly: 999,
        priceYearly: 9999,
        currency: "INR",
        maxQuizzesPerMonth: -1, // Unlimited
        maxAiGenerationsPerMonth: -1, // Unlimited
        maxCollaborators: 5,
        maxActiveQuizzes: -1,
        advancedTemplates: true,
        customBranding: true,
        prioritySupport: true,
        advancedAnalytics: true,
        isActive: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Subscription tiers seeded successfully");
}

// <---------------- USER MIGRATION ---------------->
async function migrateExistingUsers() {
  console.log("Migrating existing users to FREE tier...");

  const freeTier = await prisma.subscriptionTier.findUnique({
    where: { name: "FREE" },
  });

  if (!freeTier) {
    throw new Error("FREE tier not found. Run seedSubscriptionTiers first.");
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ currentTier: null }, { currentTier: "" }],
    },
  });

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    // Assign FREE tier
    await prisma.user.update({
      where: { id: user.id },
      data: { currentTier: "FREE" },
    });

    // Create FREE subscription if not exists
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id },
    });

    if (!existingSubscription) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          tierId: freeTier.id,
          status: "ACTIVE",
          billingInterval: "MONTHLY",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date("2099-12-31"), // Never expires
          amount: 0,
          currency: "INR",
        },
      });
    }
  }

  console.log(`✓ Migrated ${users.length} users to FREE tier`);
}

// <---------------- TEMPLATE SEEDING ---------------->
async function seedTemplates() {
  console.log("Seeding templates...");
  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: {
        id: t.id,
        backgroundColor: t.backgroundColor,
        textColor: t.textColor,
        borderColor: t.borderColor,
        accentType: t.accentType,
        accentColor: t.accentColor,
        itemsColor: t.itemsColor,
        bars: t.bars,
        src: t.src,
      },
      create: {
        id: t.id,
        name: t.name as TemplateEnum,
        backgroundColor: t.backgroundColor,
        textColor: t.textColor,
        borderColor: t.borderColor,
        accentType: t.accentType,
        accentColor: t.accentColor,
        itemsColor: t.itemsColor,
        bars: t.bars,
        src: t.src,
      },
    });
  }
  console.log("Templates synced successfully");
}

// <---------------- MAIN ---------------->
async function main() {
  try {
    await seedSubscriptionTiers();
    await migrateExistingUsers();
    await seedTemplates();
    console.log("\n✓ Database seeding completed successfully!\n");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
