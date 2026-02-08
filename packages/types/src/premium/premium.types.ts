export enum BILLING_INTERVAL {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export interface SubscriptionTierDTO {
  id: string;
  name: string; // 'FREE' | 'PRO' | 'ENTERPRISE'
  displayName: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  maxQuizzesPerMonth: number;
  maxAiGenerationsPerMonth: number;
  maxCollaborators: number;
  maxActiveQuizzes: number;
  advancedTemplates: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  sortOrder: number;
}

export const premium_features = [
  {
    id: "free",
    name: "Free",
    description: "Easiest way to try Mentimeter.",
    price: {
      amount: 0,
      currency: "EUR",
      interval: "forever",
    },
    badge: null,
    cta: {
      label: "Current plan",
      action: null,
      disabled: true,
    },
    features: [
      {
        label: "50 participants per month",
        icon: "Users",
      },
      {
        label: "Unlimited participants once per month",
        icon: "CalendarCheck",
      },
      {
        label: "Multiple question types",
        subLabel: "Word Clouds, Polls, Quizzes & more",
        icon: "Layers",
      },
      {
        label: "Session insights & feedback",
        icon: "BarChart3",
      },
    ],
  },

  {
    id: "pro",
    name: "Pro",
    description: "Powerful tools for customization.",
    price: {
      amount: 16,
      currency: "EUR",
      interval: "month",
      billed: "yearly",
    },
    badge: {
      label: "Recommended",
      icon: "Star",
    },
    cta: {
      label: "Upgrade to Pro",
      action: "upgrade_pro",
      disabled: false,
    },
    features: [
      {
        label: "Advanced design capabilities",
        subLabel: "Match your brand or preferences",
        icon: "Palette",
      },
      {
        label: "Workspace collaboration",
        subLabel: "Share themes and templates",
        icon: "Users2",
      },
      {
        label: "Co-create slides",
        subLabel: "Edit and present together",
        icon: "Edit3",
      },
      {
        label: "Live presentation control",
        subLabel: "Moderate Q&A and view live results",
        icon: "MonitorPlay",
      },
    ],
  },
];
