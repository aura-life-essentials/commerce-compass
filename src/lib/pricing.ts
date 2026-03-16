export interface PricingSnapshot {
  basePrice: number;
  optimizedPrice: number;
  compareAtPrice: number | null;
  competitorPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  undercutPercent: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const roundPsychologicalPrice = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 0;

  if (value < 10) {
    return Number((Math.floor(value) + 0.99).toFixed(2));
  }

  const roundedWhole = Math.round(value);
  return Number((Math.max(roundedWhole - 0.01, 0.99)).toFixed(2));
};

export const getOptimizedPrice = (basePrice: number, compareAtPrice?: number | null) => {
  if (!Number.isFinite(basePrice) || basePrice <= 0) return 0;

  const normalizedCompareAt = compareAtPrice && compareAtPrice > basePrice ? compareAtPrice : null;
  const competitorPrice = normalizedCompareAt ?? Number((basePrice * 1.18).toFixed(2));
  const targetBelowCompetitor = competitorPrice * 0.96;
  const floor = basePrice;
  const ceiling = Math.max(basePrice, competitorPrice - 0.01);

  return roundPsychologicalPrice(clamp(targetBelowCompetitor, floor, ceiling));
};

export const getPricingSnapshot = (basePrice: number, compareAtPrice?: number | null): PricingSnapshot => {
  const optimizedPrice = getOptimizedPrice(basePrice, compareAtPrice);
  const competitorPrice = compareAtPrice && compareAtPrice > optimizedPrice
    ? compareAtPrice
    : Number((Math.max(basePrice, optimizedPrice) * 1.18).toFixed(2));
  const savingsAmount = Math.max(0, Number((competitorPrice - optimizedPrice).toFixed(2)));
  const savingsPercent = competitorPrice > 0
    ? Math.max(0, Math.round((savingsAmount / competitorPrice) * 100))
    : 0;
  const undercutPercent = competitorPrice > 0
    ? Math.max(0, Number((((competitorPrice - optimizedPrice) / competitorPrice) * 100).toFixed(1)))
    : 0;

  return {
    basePrice,
    optimizedPrice,
    compareAtPrice: compareAtPrice && compareAtPrice > 0 ? compareAtPrice : null,
    competitorPrice,
    savingsAmount,
    savingsPercent,
    undercutPercent,
  };
};
