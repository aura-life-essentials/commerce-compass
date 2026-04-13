// Subscription tier configuration with Stripe price IDs
export type SubscriptionTier = 'core' | 'pro' | 'enterprise';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: number | null;
  priceId: string;
  productId: string;
  billingCycle: 'monthly' | 'custom';
  features: string[];
  color: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: TierConfig[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Essential AI sales automation',
    price: 97,
    priceId: 'price_1TLtK0Fpvr5YnJS74uUhKJAU',
    productId: 'prod_UKYQtaG6E6rZHM',
    billingCycle: 'monthly',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Lead Qualifier Agent — scores and qualifies inbound leads',
      'Nurture Agent — automated personalized follow-up sequences',
      'Basic revenue analytics dashboard',
      'Email support',
      'Up to 500 leads/month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full autonomous revenue system',
    price: 297,
    priceId: 'price_1TLtK2Fpvr5YnJS743sxV1Cj',
    productId: 'prod_UKYQb6WviGa1xn',
    billingCycle: 'monthly',
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'All 5 AI Agents — Qualifier, Nurture, Closer, Onboarding, Orchestrator',
      'Advanced workflow automation',
      'Full command center dashboard',
      'Priority support',
      'Unlimited leads',
      'Agent activity logs and analytics',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom-built for your operation',
    price: null,
    priceId: '',
    productId: '',
    billingCycle: 'custom',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Pro',
      'Dedicated onboarding and setup',
      'Custom agent configurations',
      'White-glove integration support',
      'Custom API access',
      'Dedicated account manager',
    ],
  },
];

export const getTierByProductId = (productId: string): TierConfig | undefined => {
  return SUBSCRIPTION_TIERS.find(tier => tier.productId === productId);
};

export const getTierById = (tierId: SubscriptionTier): TierConfig | undefined => {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
};
