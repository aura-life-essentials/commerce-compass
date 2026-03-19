// App Store product definitions - Stripe IDs populated after setup
export interface AppProduct {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  priceId: string;
  productId: string;
  category: 'ai-agents' | 'e-commerce' | 'web3' | 'media';
  icon: string;
  features: string[];
  highlights: string[];
  color: string;
}

// These will be populated by the setup-app-products edge function
// For now, use the create-subscription-checkout which accepts priceId
export const APP_PRODUCTS: AppProduct[] = [
  {
    id: 'ceo-brain',
    name: 'CEO Brain Pro',
    slug: 'ceo-brain',
    tagline: 'Strategic AI Command Center',
    description: 'Runs strategic decisions and agent orchestration. Your AI-powered executive brain that coordinates all business operations.',
    price: 725,
    priceId: '', // Set after Stripe setup
    productId: '',
    category: 'ai-agents',
    icon: 'Brain',
    color: 'from-violet-500 to-purple-600',
    features: [
      'Real-time strategic decision engine',
      'Multi-agent orchestration',
      'Revenue optimization AI',
      'Automated market analysis',
      'Priority support',
    ],
    highlights: ['AI-Powered', 'Real-Time', 'Autonomous'],
  },
  {
    id: 'sales-network',
    name: 'Autonomous Sales Network Pro',
    slug: 'sales-network',
    tagline: 'Full-Cycle Sales Automation',
    description: 'Automates the full sales cycle from research to close. AI agents handle prospecting, outreach, negotiation, and closing.',
    price: 1200,
    priceId: '',
    productId: '',
    category: 'ai-agents',
    icon: 'Users',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Automated lead research',
      'AI-powered outreach sequences',
      'Smart negotiation engine',
      'Deal closing automation',
      'CRM integration',
      'Performance analytics',
    ],
    highlights: ['Full-Cycle', 'AI Agents', 'Automated'],
  },
  {
    id: '200-agent-network',
    name: '200-Agent Autonomous Sales Network',
    slug: '200-agent-network',
    tagline: 'Enterprise Sales Army',
    description: 'Deploys 40 teams of 5 specialized agents with interchangeable brains. Strategic, Creative, Aggressive, Persuasive, and Analytical modes across the full pipeline.',
    price: 3600,
    priceId: '',
    productId: '',
    category: 'ai-agents',
    icon: 'Zap',
    color: 'from-amber-500 to-red-500',
    features: [
      '40 teams × 5 specialized agents',
      '5 interchangeable brain templates',
      'Research → Content → Market → Close → Analyze',
      'Autonomous campaign execution',
      'Real-time leaderboards',
      'White-glove onboarding',
      'Dedicated account manager',
    ],
    highlights: ['200 Agents', '40 Teams', 'Enterprise'],
  },
  {
    id: 'checkout-engine',
    name: 'Checkout Conversion Engine Pro',
    slug: 'checkout-engine',
    tagline: 'Maximize Every Transaction',
    description: 'Lifts conversion rate with intelligent upsells, cart optimization, and checkout flow improvements.',
    price: 360,
    priceId: '',
    productId: '',
    category: 'e-commerce',
    icon: 'ShoppingCart',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Smart upsell recommendations',
      'Cart abandonment recovery',
      'One-click order bumps',
      'A/B tested checkout flows',
      'Revenue analytics',
    ],
    highlights: ['High-ROI', 'Automated', 'Data-Driven'],
  },
  {
    id: 'web3-engine',
    name: 'Web3 Launch Engine Pro',
    slug: 'web3-engine',
    tagline: 'Launch Your Web3 Empire',
    description: 'Launches communities, tokens, NFTs, and investor-ready assets. Complete Web3 infrastructure in one tool.',
    price: 600,
    priceId: '',
    productId: '',
    category: 'web3',
    icon: 'Globe',
    color: 'from-indigo-500 to-violet-500',
    features: [
      'NFT collection deployment',
      'Token creation & distribution',
      'DAO governance setup',
      'Community management tools',
      'Investor pitch deck generator',
    ],
    highlights: ['Web3', 'NFTs', 'DAO'],
  },
  {
    id: 'content-factory',
    name: 'Content Factory Pro',
    slug: 'content-factory',
    tagline: 'Produce Content at Scale',
    description: 'Produces videos, scripts, voiceovers, and presentations fast. AI-powered content production pipeline.',
    price: 430,
    priceId: '',
    productId: '',
    category: 'media',
    icon: 'Video',
    color: 'from-pink-500 to-rose-500',
    features: [
      'AI video script generation',
      'Voiceover synthesis',
      'Thumbnail creation',
      'Multi-platform formatting',
      'Content calendar automation',
    ],
    highlights: ['AI Content', 'Multi-Platform', 'Automated'],
  },
];

export const getAppBySlug = (slug: string) => APP_PRODUCTS.find(p => p.slug === slug);
export const getAppsByCategory = (category: string) => APP_PRODUCTS.filter(p => p.category === category);
