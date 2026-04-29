import { Check, Minus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';
import { formatCurrency } from '@/lib/formatCurrency';

type Cell = boolean | string;

interface FeatureRow {
  label: string;
  values: [Cell, Cell, Cell]; // core, pro, enterprise
  group?: string;
}

const ROWS: FeatureRow[] = [
  { group: 'AI Agents', label: 'Lead Qualifier Agent', values: [true, true, true] },
  { group: 'AI Agents', label: 'Nurture Agent', values: [true, true, true] },
  { group: 'AI Agents', label: 'Closer Agent', values: [false, true, true] },
  { group: 'AI Agents', label: 'Onboarding Agent', values: [false, true, true] },
  { group: 'AI Agents', label: 'Orchestrator (CEO Brain)', values: [false, true, true] },

  { group: 'Volume', label: 'Leads / month', values: ['500', 'Unlimited', 'Unlimited'] },
  { group: 'Volume', label: 'Workflows', values: ['Basic', 'Unlimited', 'Custom'] },
  { group: 'Volume', label: 'Connectors', values: ['3', 'All', 'All + Custom'] },

  { group: 'Intelligence', label: 'Multi-AI consensus engine', values: [false, true, true] },
  { group: 'Intelligence', label: 'Decision engine + memory', values: [false, true, true] },
  { group: 'Intelligence', label: 'Voice command surface', values: [false, true, true] },

  { group: 'Support', label: 'Support channel', values: ['Email', 'Priority', 'Dedicated CSM'] },
  { group: 'Support', label: 'White-glove onboarding', values: [false, false, true] },
  { group: 'Support', label: 'SLA', values: [false, false, true] },
];

function CellView({ value }: { value: Cell }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-green-500 mx-auto" aria-label="Included" />;
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" aria-label="Not included" />;
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export function PricingComparisonTable() {
  // Group rows
  const groups = ROWS.reduce<Record<string, FeatureRow[]>>((acc, row) => {
    const g = row.group || 'Features';
    (acc[g] ||= []).push(row);
    return acc;
  }, {});

  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <Badge className="border-primary/25 bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" /> Compare Plans
          </Badge>
          <h2 className="text-3xl font-bold md:text-4xl">
            Every feature, side-by-side
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No surprises. Here's exactly what's in each plan so you can pick the one that pays for itself fastest.
          </p>
        </div>

        <div className="oro-card border border-border/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-card/40 border-b border-border/40">
                <tr>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      className={`p-4 text-center min-w-[140px] ${
                        tier.popular ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-base">{tier.name}</span>
                        {tier.popular && (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            Most Popular
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {tier.price !== null
                            ? `${formatCurrency(tier.price)}/mo`
                            : 'Custom'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([group, rows]) => (
                  <>
                    <tr key={`group-${group}`} className="bg-card/20">
                      <td
                        colSpan={SUBSCRIPTION_TIERS.length + 1}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary/80"
                      >
                        {group}
                      </td>
                    </tr>
                    {rows.map((row, idx) => (
                      <tr
                        key={`${group}-${idx}`}
                        className="border-t border-border/30 hover:bg-card/30 transition-colors"
                      >
                        <td className="p-4 text-sm">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={`p-4 text-center ${
                              SUBSCRIPTION_TIERS[i]?.popular ? 'bg-primary/5' : ''
                            }`}
                          >
                            <CellView value={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}