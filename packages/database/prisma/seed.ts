import { prisma } from '../src/client';

async function seedSubscriptionTiers() {
  console.log('Seeding subscription tiers...');

  await prisma.subscriptionTier.createMany({
    data: [
      {
        name: 'FREE',
        displayName: 'Free Plan',
        description: 'Perfect for getting started with quiz creation',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'INR',
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
        name: 'PRO',
        displayName: 'Pro Plan',
        description: 'For professional quiz creators and educators',
        priceMonthly: 999, // ₹999/month
        priceYearly: 9999, // ₹9,999/year (2 months free)
        currency: 'INR',
        maxQuizzesPerMonth: -1, // Unlimited
        maxAiGenerationsPerMonth: -1, // Unlimited
        maxCollaborators: 5,
        maxActiveQuizzes: -1, // Unlimited
        advancedTemplates: true,
        customBranding: true,
        prioritySupport: true,
        advancedAnalytics: true,
        isActive: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true, // Skip if tiers already exist
  });

  console.log('✓ Subscription tiers seeded successfully');
}

async function migrateExistingUsers() {
  console.log('Migrating existing users to FREE tier...');

  // Get the FREE tier
  const freeTier = await prisma.subscriptionTier.findUnique({
    where: { name: 'FREE' },
  });

  if (!freeTier) {
    throw new Error('FREE tier not found. Run seedSubscriptionTiers first.');
  }

  // Find all users without a current tier
  const users = await prisma.user.findMany({
    where: {
      OR: [{ currentTier: null }, { currentTier: '' }],
    },
  });

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    // Update user with FREE tier
    await prisma.user.update({
      where: { id: user.id },
      data: { currentTier: 'FREE' },
    });

    // Create FREE subscription for user
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id },
    });

    if (!existingSubscription) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          tierId: freeTier.id,
          status: 'ACTIVE',
          billingInterval: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date('2099-12-31'), // Never expires for free tier
          amount: 0,
          currency: 'INR',
        },
      });
    }
  }

  console.log(`✓ Migrated ${users.length} users to FREE tier`);
}

async function main() {
  try {
    await seedSubscriptionTiers();
    await migrateExistingUsers();
    console.log('\n✓ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
