import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  DollarSign,
  Radar,
  ShoppingCart,
  Sparkles,
  Store,
  Trophy,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCeoBrain } from "@/hooks/useCeoBrain";
import { useSalesControlPlane } from "@/hooks/useSalesControlPlane";
import { toast } from "sonner";

const commandPresets = [
  {
    label: "Compound Sales Loop",
    description: "Run a full revenue cycle across stores, Stripe signals, and agent actions.",
    command: "Run a full autonomy growth cycle across all stores, Stripe revenue, and agent telemetry. Optimize for compounding sales and monetization.",
  },
  {
    label: "Scale Winners",
    description: "Intensify focus on high-performing offers and the channels already converting.",
    command: "Analyze orders and revenue to identify the strongest products, then scale the best offers, bundles, and sales agents immediately.",
  },
  {
    label: "Deploy Swarm",
    description: "Push the sales race into action mode and accelerate the top agents now.",
    command: "SELL NOW: deploy the full revenue swarm, group agents into competing teams, and maximize sales velocity across all monetization surfaces.",
  },
  {
    label: "Monetize Ecosystem",
    description: "Coordinate products, subscriptions, services, and all stores into one engine.",
    command: "Create a unified monetization plan across products, subscriptions, services, and all active stores. Prioritize the highest-leverage revenue actions now.",
  },
];

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

export const RevenueControlPlane = () => {
  const { data, isLoading } = useSalesControlPlane();
  const { think, isThinking } = useCeoBrain();

  const triggerCommand = (command: string, label: string) => {
    think(command);
    toast.success(`${label} started`);
  };

  return (
    <Card className="glass overflow-hidden border-border/60 shadow-[var(--shadow-lg)]">
      <CardHeader className="relative overflow-hidden border-b border-border/50 bg-card/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--accent-foreground)/0.08),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Backend live orchestration
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-5 w-5 text-primary" />
              Revenue Control Plane
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Live backend summary for stores, orders, Stripe revenue, sales race telemetry, and autonomous agent execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/30 bg-background/40 text-primary">
              {isThinking ? "Autonomy running" : "Autonomy ready"}
            </Badge>
            <Badge variant="outline" className="border-border bg-background/40 text-foreground">
              {data?.totals.stores ?? 0} stores
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {isLoading || !data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4 shadow-[var(--shadow-sm)]">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Total Revenue
                </p>
                <p className="text-3xl font-bold">{formatCurrency(data.totals.revenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">AOV {formatCurrency(data.health.avgOrderValue)}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4 shadow-[var(--shadow-sm)]">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <ShoppingCart className="h-3.5 w-3.5" /> Order Engine
                </p>
                <p className="text-3xl font-bold">{data.totals.orders}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.health.completedOrders} completed • {data.health.pendingOrders} pending</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4 shadow-[var(--shadow-sm)]">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Store className="h-3.5 w-3.5" /> Store Network
                </p>
                <p className="text-3xl font-bold">{data.totals.stores}</p>
                <p className="mt-1 text-xs text-muted-foreground">Stripe-backed receipts: {data.totals.succeededStripeTransactions}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/35 p-4 shadow-[var(--shadow-sm)]">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" /> Agent Network
                </p>
                <p className="text-3xl font-bold">{data.totals.activeAgents}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.totals.pendingDecisions} queued decisions</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5 shadow-[var(--shadow-glow)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compounding pressure index</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Revenue delta {data.health.revenueDelta >= 0 ? "+" : ""}{formatCurrency(data.health.revenueDelta)} from the latest measured cycle.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left lg:text-right">
                    <div>
                      <p className="text-2xl font-bold text-primary">{Math.round(data.health.autonomousReadiness)}%</p>
                      <p className="text-xs text-muted-foreground">autonomy readiness</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{data.salesRace.liveAgents}</p>
                      <p className="text-xs text-muted-foreground">race agents</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{data.salesRace.title || "Sales race progress"}</span>
                    <span>{Math.round(data.salesRace.progress)}%</span>
                  </div>
                  <Progress value={data.salesRace.progress} className="h-3" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Radar className="h-3.5 w-3.5" /> Stripe</p>
                    <p className="text-lg font-semibold">{formatCurrency(data.totals.stripeRevenue)}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Orders</p>
                    <p className="text-lg font-semibold">{formatCurrency(data.totals.orderRevenue)}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Trophy className="h-3.5 w-3.5" /> Leader</p>
                    <p className="text-lg font-semibold">{data.salesRace.winningAgentName || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                    <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Zap className="h-3.5 w-3.5" /> Race Revenue</p>
                    <p className="text-lg font-semibold">{formatCurrency(data.salesRace.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-5">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Autonomous plays</h4>
                <div className="space-y-3">
                  {commandPresets.map((preset, index) => (
                    <motion.div
                      key={preset.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-xl border border-border/60 bg-secondary/25 p-4"
                    >
                      <div className="mb-3">
                        <p className="font-medium">{preset.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                      </div>
                      <Button
                        onClick={() => triggerCommand(preset.command, preset.label)}
                        disabled={isThinking}
                        variant="outline"
                        className="w-full border-primary/30 bg-background/40 hover:bg-primary/10"
                      >
                        Trigger play
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[1.5rem] border border-border/60 bg-card/45 p-5">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Connected stores</h4>
                <div className="space-y-3">
                  {data.stores.length > 0 ? data.stores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{store.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{store.domain}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{store.status || "unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {store.lastSyncedAt ? `Synced ${formatDistanceToNow(new Date(store.lastSyncedAt), { addSuffix: true })}` : "Awaiting sync"}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No connected stores yet.</div>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-border/60 bg-card/45 p-5">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Top traffic sources</h4>
                  <div className="space-y-3">
                    {data.signals.topSources.length > 0 ? data.signals.topSources.map((source) => (
                      <div key={source.source} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="font-medium capitalize">{source.source}</p>
                          <p className="text-sm text-primary">{formatCurrency(source.revenue)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{source.events} tracked events</p>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No attribution data yet.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/60 bg-card/45 p-5">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Agent activity</h4>
                  <div className="space-y-3">
                    {data.signals.recentAgentActions.length > 0 ? data.signals.recentAgentActions.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="font-medium">{item.agentName}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.status || "logged"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.action}</p>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No live actions yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
