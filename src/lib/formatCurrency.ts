// Locale-safe currency formatter.
// Falls back gracefully if Intl / locale is unavailable so checkout never breaks.
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale?: string
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const resolvedLocale =
    locale ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    'en-US';

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    // Fallback if locale or currency code is invalid
    return `$${safeAmount.toFixed(safeAmount % 1 === 0 ? 0 : 2)}`;
  }
}

export function formatPricePerMonth(
  amount: number,
  currency: string = 'USD',
  locale?: string
): string {
  return `${formatCurrency(amount, currency, locale)}/mo`;
}