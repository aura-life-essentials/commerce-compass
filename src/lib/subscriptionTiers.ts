// Subscription tier configuration with Stripe price IDs
export type SubscriptionTier = 'starter' | 'growth' | 'pro' | 'enterprise' | 'elite';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  priceId: string;
  productId: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  features: string[];
  nftBenefits: string[];
  color: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Web3 Foundations',
    price: 19,
    priceId: 'price_1TDxIdFpvr5YnJS7Ffxv1mLK',
    productId: 'prod_UCM0gN7s21PcXz',
    billingCycle: 'weekly',
    color: 'from-slate-500 to-slate-600',
    features: [
      'Web3 basics education',
      'Industry roadmap consultation',
      'Community Discord access',
      'Weekly strategy calls',
      'Basic AI assistant',
    ],
    nftBenefits: [
      'Bronze member badge NFT',
      'Community voting rights',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Web3 Website Builder',
    price: 49,
    priceId: 'price_1TDxIeFpvr5YnJS73fmOxPG7',
    productId: 'prod_UCM0uAHgcy0T78',
    billingCycle: 'monthly',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Everything in Starter',
      'Custom Web3 website creation',
      'Wallet integration setup',
      'NFT display galleries',
      'Priority email support',
      'Monthly strategy sessions',
    ],
    nftBenefits: [
      'Silver member badge NFT',
      'Early access to features',
      '5% marketplace fee discount',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'NFT & DAO Package',
    price: 199,
    priceId: 'price_1TDxIgFpvr5YnJS7dCWALR8s',
    productId: 'prod_UCM0TnPVKoKxYH',
    billingCycle: 'monthly',
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Everything in Growth',
      'Full NFT collection launch',
      'Smart contract deployment',
      'DAO governance setup',
      'Token creation & distribution',
      '24/7 AI agent support',
      'Custom roadmap creation',
    ],
    nftBenefits: [
      'Gold member badge NFT',
      '10% revenue share rights',
      'Exclusive metaverse access',
      'Priority listing on all platforms',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full Web3 Suite',
    price: 499,
    priceId: 'price_1TDxIhFpvr5YnJS7zHvAFQRo',
    productId: 'prod_UCM0lFVcb6UdSl',
    billingCycle: 'monthly',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Pro',
      'Complete Web3 infrastructure',
      'Crypto payment integration',
      'Multi-chain deployment',
      'Custom AI agents for your business',
      'Dedicated account manager',
      'White-label solutions',
    ],
    nftBenefits: [
      'Platinum member badge NFT',
      '15% revenue share rights',
      'Private metaverse office',
      'Zero marketplace fees',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Industry Revolution Partner',
    price: 2500,
    priceId: 'price_1TDxIiFpvr5YnJS7hLnYb6I1',
    productId: 'prod_UCM0wOtx8wLSLq',
    billingCycle: 'yearly',
    color: 'from-yellow-400 via-amber-500 to-red-500',
    features: [
      'Everything in Enterprise',
      'Data-driven industry roadmaps',
      'Guaranteed revenue increase strategies',
      'Full ecosystem buildout',
      'White-glove concierge service',
      'Quarterly in-person strategy sessions',
      'Equity partnership options',
      'First access to new features',
    ],
    nftBenefits: [
      'Diamond member badge NFT',
      '25% revenue share rights',
      'DAO board seat',
      'Personal AI agent army',
      'Lifetime platform access',
    ],
  },
];

export const getTierByProductId = (productId: string): TierConfig | undefined => {
  return SUBSCRIPTION_TIERS.find(tier => tier.productId === productId);
};

export const getTierById = (tierId: SubscriptionTier): TierConfig | undefined => {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
};
