export type MonetizationAudience = 'solo-founders' | 'agencies' | 'brands-startups' | 'enterprise' | 'autonomous-network';

export interface AppIdea {
  name: string;
  category: string;
  outcome: string;
  monthlyValue: number;
}

export interface GeneratedOffer {
  name: string;
  type: 'individual' | 'bundle' | 'suite' | 'upsell';
  price: number;
  pitch: string;
  includes: string[];
}

const audienceMultipliers: Record<MonetizationAudience, number> = {
  'solo-founders': 1,
  agencies: 1.35,
  'brands-startups': 1.2,
  enterprise: 1.9,
  'autonomous-network': 2.4,
};

const categoryBundleNames: Record<string, string> = {
  'AI Agents': 'Autonomous Revenue Bundle',
  'E-commerce': 'Commerce Conversion Bundle',
  'Web3': 'Web3 Launch Bundle',
  'Media / Content': 'Content Velocity Bundle',
  Other: 'Custom Ops Bundle',
};

export const parseApps = (input: string): AppIdea[] => {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [namePart, categoryPart, outcomePart, valuePart] = line.split('|').map((part) => part?.trim());
      return {
        name: namePart || `App ${index + 1}`,
        category: categoryPart || 'Other',
        outcome: outcomePart || 'Automates a painful workflow and creates measurable ROI',
        monthlyValue: Number(valuePart) || 49,
      } satisfies AppIdea;
    });
};

const roundPrice = (value: number) => {
  if (value < 100) return Math.round(value / 5) * 5;
  if (value < 500) return Math.round(value / 10) * 10;
  return Math.round(value / 25) * 25;
};

export const generateOffers = (apps: AppIdea[], audience: MonetizationAudience): GeneratedOffer[] => {
  if (!apps.length) return [];

  const multiplier = audienceMultipliers[audience];

  const individualOffers = apps.map((app) => ({
    name: `${app.name} Pro`,
    type: 'individual' as const,
    price: roundPrice(Math.max(19, app.monthlyValue * multiplier)),
    pitch: `${app.name} sold as a standalone monthly tool for teams that want ${app.outcome.toLowerCase()}.`,
    includes: [app.name, app.outcome, 'Core onboarding', 'Monthly optimization review'],
  }));

  const grouped = apps.reduce<Record<string, AppIdea[]>>((acc, app) => {
    acc[app.category] ??= [];
    acc[app.category].push(app);
    return acc;
  }, {});

  const bundleOffers = Object.entries(grouped).map(([category, categoryApps]) => ({
    name: categoryBundleNames[category] || `${category} Bundle`,
    type: 'bundle' as const,
    price: roundPrice(categoryApps.reduce((sum, app) => sum + app.monthlyValue, 0) * multiplier * 1.8),
    pitch: `A grouped offer for ${category.toLowerCase()} buyers who want faster implementation and better retention than buying tools one by one.`,
    includes: categoryApps.map((app) => app.name),
  }));

  const suiteOffers: GeneratedOffer[] = [
    {
      name: 'Operator Suite',
      type: 'suite',
      price: roundPrice(apps.reduce((sum, app) => sum + app.monthlyValue, 0) * multiplier * 2.4),
      pitch: 'An all-in-one subscription for buyers who want execution, automation, and monetization in one stack.',
      includes: apps.slice(0, 8).map((app) => app.name),
    },
    {
      name: 'Command Center Suite',
      type: 'suite',
      price: roundPrice(apps.reduce((sum, app) => sum + app.monthlyValue, 0) * multiplier * 3.2),
      pitch: 'Premium suite packaging with priority support, implementation help, and high-ticket positioning.',
      includes: [...apps.slice(0, 8).map((app) => app.name), 'Priority onboarding', 'Revenue sprint reviews'],
    },
  ];

  const upsellOffers: GeneratedOffer[] = [
    {
      name: 'Done-For-You Launch Sprint',
      type: 'upsell',
      price: roundPrice(Math.max(199, apps.length * 79 * multiplier)),
      pitch: 'High-margin add-on for setup, implementation, automation wiring, and first-launch execution.',
      includes: ['Setup sprint', 'Launch assets', 'Implementation support'],
    },
    {
      name: 'Autonomous Growth Add-On',
      type: 'upsell',
      price: roundPrice(Math.max(149, apps.length * 59 * multiplier)),
      pitch: 'Recurring upsell for optimization, reporting, and conversion improvements every month.',
      includes: ['Monthly optimization', 'Performance reporting', 'Upsell tuning'],
    },
  ];

  return [...individualOffers, ...bundleOffers, ...suiteOffers, ...upsellOffers];
};

export const getOfferSummary = (offers: GeneratedOffer[]) => {
  const monthlyRevenue = offers.reduce((sum, offer) => sum + offer.price, 0);
  const entry = offers.filter((offer) => offer.type === 'individual').reduce((min, offer) => Math.min(min, offer.price), Number.POSITIVE_INFINITY);
  const flagship = offers.filter((offer) => offer.type === 'suite').reduce((max, offer) => Math.max(max, offer.price), 0);

  return {
    monthlyRevenue,
    entryPrice: Number.isFinite(entry) ? entry : 0,
    flagshipPrice: flagship,
  };
};
