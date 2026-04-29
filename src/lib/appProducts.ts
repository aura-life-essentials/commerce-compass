// Standalone app products (real Stripe price IDs).
// Wired through the same `create-subscription-checkout` edge function as tiers.
export interface AppProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  priceId: string;
  productId: string;
  billingCycle: 'monthly';
  badge?: string;
  accent: string;
  features: string[];
  // Detail page
  longDescription?: string;
  outcomes?: { metric: string; description: string }[];
  bestFor?: string[];
  faqs?: { q: string; a: string }[];
}

export const APP_PRODUCTS: AppProduct[] = [
  {
    id: 'ceo-brain-starter',
    name: 'CEO Brain — Starter',
    tagline: 'Empire OS for solo founders',
    description: 'AI command center with the essentials: workflows, KPI dashboard, and 3 connectors.',
    price: 49,
    priceId: 'price_1TPzQMFpvr5YnJS77Y1wgbzM',
    productId: 'prod_UOn0MRwYffX9kG',
    billingCycle: 'monthly',
    accent: 'from-cyan-500 to-blue-500',
    features: [
      'CEO Brain orchestration core',
      'Up to 3 connectors',
      'KPI dashboard',
      'Email support',
    ],
  },
  {
    id: 'ceo-brain-pro',
    name: 'CEO Brain — Pro',
    tagline: 'Full marketing engine + workflows',
    description: 'Unlocks the full automation engine: unlimited workflows, voice commands, and decision engine.',
    price: 149,
    priceId: 'price_1TPzQMFpvr5YnJS7feiqMetX',
    productId: 'prod_UOn0AADHi0BOLP',
    billingCycle: 'monthly',
    badge: 'Most Popular',
    accent: 'from-primary to-cyan-400',
    features: [
      'All connectors unlocked',
      'Unlimited workflows',
      'Voice command surface',
      'Decision engine + memory',
      'Priority support',
    ],
  },
  {
    id: 'ceo-brain-godmode',
    name: 'CEO Brain — Godmode',
    tagline: 'Unlimited AI, every connector',
    description: 'Full access to every agent, every connector, and the multi-AI consensus engine.',
    price: 499,
    priceId: 'price_1TPzQLFpvr5YnJS7DexY4Z8V',
    productId: 'prod_UOn0i5xRp3FDPQ',
    billingCycle: 'monthly',
    accent: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Pro',
      'Multi-AI consensus engine',
      'Dedicated infrastructure tier',
      'Priority routing on AI gateway',
      'White-glove onboarding',
    ],
  },
  {
    id: 'profit-reaper',
    name: 'Profit Reaper Engine',
    tagline: 'Automated revenue optimization',
    description: 'Pricing experiments, churn prediction, and LTV maximization — running 24/7 against your live data.',
    price: 149,
    priceId: 'price_1TPzQKFpvr5YnJS7wdOEY27A',
    productId: 'prod_UOn0mkSXLeJlE0',
    billingCycle: 'monthly',
    accent: 'from-fuchsia-500 to-purple-600',
    features: [
      'Continuous price experiments',
      'Churn prediction signals',
      'LTV maximization loops',
      'Real-time revenue alerts',
    ],
  },
];

export const getAppProductByPriceId = (priceId: string): AppProduct | undefined =>
  APP_PRODUCTS.find((p) => p.priceId === priceId);

export const getAppProductById = (id: string): AppProduct | undefined =>
  APP_PRODUCTS.find((p) => p.id === id);

// Shared detail-page enrichment so every product has a usable detail view.
export const productDetailDefaults = {
  bestFor: [
    'Founders done with manual follow-up',
    'Agencies scaling delivery without headcount',
    'Sales teams that lose deals to slow response times',
  ],
  outcomes: [
    { metric: '24/7', description: 'Autonomous operation — never sleeps, never forgets' },
    { metric: '<60s', description: 'Speed-to-lead on every inbound signal' },
    { metric: '10x', description: 'More follow-ups without hiring a single person' },
  ],
  faqs: [
    {
      q: 'How does the 3-day free trial work?',
      a: 'You get full access immediately. Cancel anytime in the first 3 days from your customer portal and you will not be charged.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. One click from the secure Stripe customer portal — no calls, no emails, no friction.',
    },
    {
      q: 'Is my data safe?',
      a: 'All data is encrypted in transit and at rest. We use bank-grade infrastructure and never share your data.',
    },
  ],
};