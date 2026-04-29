import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatCurrency';

const SDR_ANNUAL_SALARY = 65000;
const PRO_ANNUAL_COST = 297 * 12; // $3,564
const SAVINGS = SDR_ANNUAL_SALARY - PRO_ANNUAL_COST;

const stats = [
  {
    icon: DollarSign,
    label: 'vs. one human SDR',
    value: formatCurrency(SAVINGS),
    suffix: '/yr saved',
    accent: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    label: 'Hours back per week',
    value: '20+',
    suffix: 'on follow-up',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    label: 'Leads worked in parallel',
    value: '∞',
    suffix: '24/7',
    accent: 'from-primary to-fuchsia-500',
  },
  {
    icon: TrendingUp,
    label: 'Speed-to-lead',
    value: '<60s',
    suffix: 'every time',
    accent: 'from-amber-500 to-orange-500',
  },
];

export function ROIPanel() {
  return (
    <section className="container mx-auto px-4 py-16 md:px-6 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 space-y-3"
      >
        <Badge className="border-primary/25 bg-primary/10 text-primary">
          Why it's a no-brainer
        </Badge>
        <h2 className="text-3xl font-bold md:text-4xl">
          Pays for itself in <span className="text-gradient-oro">one closed deal</span>.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The Pro plan costs less per year than one month of an SDR's salary —
          and it never sleeps, never quits, and never misses a follow-up.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="oro-card h-full border-border/40 hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.suffix}</div>
                  <div className="mt-3 text-sm font-medium">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground/70">
        Math: avg US SDR fully-loaded salary ≈ {formatCurrency(SDR_ANNUAL_SALARY)} vs Pro plan {formatCurrency(PRO_ANNUAL_COST)}/yr.
      </p>
    </section>
  );
}