import { motion } from "framer-motion";
import { Brain, DollarSign, ShoppingCart, Store, TrendingUp, Trophy, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStores } from "@/hooks/useStores";
import { useAggregatedRevenue } from "@/hooks/useRevenueMetrics";
import { useAllOrders } from "@/hooks/useOrders";
import { useCeoBrain } from "@/hooks/useCeoBrain";
import { useLatestSalesRace, useSalesRaceAgents } from "@/hooks/useSalesRace";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const commandPresets = [
  {
    label: "Compound Sales Loop",
    description: "Analyze revenue, reprioritize agents, and push the next compounding move.",
    command: "Run a full autonomy growth cycle across all stores, Stripe revenue, and agent telemetry. Optimize for compounding sales and monetization.",
  },
  {
    label: "Scale Winning Products",
    description: "Find top performers and intensify selling pressure on the best products.",
    command: "Analyze orders and revenue to identify the strongest products, then scale the best offers, bundles, and sales agents immediately.",
  },
  {
    label: "Deploy Revenue Swarm",
    description: "Activate the fastest agents and turn the sales race into the operating mode.",
    command: "SELL NOW: deploy the full revenue swarm, group agents into competing teams, and maximize sales velocity across all monetization surfaces.",
  },
  {
    label: "Monetize Ecosystem",
    description: "Coordinate store, subscriptions, and command-center monetization into one engine.",
    command: "Create a unified monetization plan across products, subscriptions, services, and all active stores. Prioritize the highest-leverage revenue actions now.",
  },
];

export const RevenueControlPlane = () => {
  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: revenueSeries, isLoading: revenueLoading } = useAggregatedRevenue();
  const { data: orders, isLoading: ordersLoading } = useAllOrders(200);
  const { data: race, isLoading: raceLoading } = useLatestSalesRace();
  const { data: raceAgents, isLoading: raceAgentsLoading } = useSalesRaceAgents(race?.id, 100);
  const { metrics, think, isThinking, agentBrains, decisions } = useCeoBrain();

  const totalRevenue = metrics?.revenue || 0;
  const totalOrders = metrics?.orders || 0;
  const totalStores = stores?.length || 0;
  const activeAgents = agentBrains?.filter((agent) => agent.is_active).length || 0;
  const liveRaceAgents = raceAgents?.length || 0;
  const latestRevenue = revenueSeries?.[revenueSeries.length - 1]?.revenue || 0;
  const previousRevenue = revenueSeries?.[revenueSeries.length - 2]?.revenue || 0;
  const revenueDelta = latestRevenue - previousRevenue;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = orders?.filter((order) => order.status === "completed").length || 0;
  const pendingOrders = orders?.filter((order) => order.status === "pending").length || 0;
  const unexecutedDecisions = decisions?.filter((decision) => !decision.executed).length || 0;
  const goalProgress = race ? Math.min(100, (Number(race.total_revenue || 0) / Number(race.target_amount || 1000)) * 100) : 0;

  const triggerCommand = (command: string, label: string) => {
    think(command);
    toast.success(`${label} started`);
  };

  const isLoading = storesLoading || revenueLoading || ordersLoading || raceLoading || raceAgentsLoading;

  return (
    <Card className="glass overflow-hidden border-border/60">
      <CardHeader className="border-b border-border/50 bg-card/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-primary" />
              Revenue Control Plane
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              One autonomous layer for stores, orders, Stripe revenue, and competing agents.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            {isThinking ? "Autonomy running" : "Autonomy ready"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Total Revenue
                </p>
                <p className="text-3xl font-bold">${Number(totalRevenue).toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">AOV ${avgOrderValue.toFixed(0)}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <ShoppingCart className="h-3.5 w-3.5" /> Order Engine
                </p>
                <p className="text-3xl font-bold">{totalOrders}</p>
                <p className="mt-1 text-xs text-muted-foreground">{completedOrders} completed • {pendingOrders} pending</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Store className="h-3.5 w-3.5" /> Store Network
                </p>
                <p className="text-3xl font-bold">{totalStores}</p>
                <p className="mt-1 text-xs text-muted-foreground">Connected monetization surfaces</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Brain className="h-3.5 w-3.5" /> Agent Network
                </p>
                <p className="text-3xl font-bold">{activeAgents}</p>
                <p className="mt-1 text-xs text-muted-foreground">{liveRaceAgents} in active competition</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compounding sales pressure</p>
                    <p className="text-xs text-muted-foreground">
                      Revenue delta {revenueDelta >= 0 ? "+" : ""}${Number(revenueDelta).toLocaleString()} from the latest cycle.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{unexecutedDecisions}</p>
                    <p className="text-xs text-muted-foreground">open AI decisions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sales race progress</span>
                      <span>{race ? `${Math.round(goalProgress)}%` : "No race"}</span>
                    </div>
                    <Progress value={goalProgress} className="h-3" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Momentum</p>
                      <p className="text-lg font-semibold">{revenueDelta >= 0 ? "Accelerating" : "Needs boost"}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Trophy className="h-3.5 w-3.5" /> Leader</p>
                      <p className="text-lg font-semibold">{race?.winning_agent_name || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Zap className="h-3.5 w-3.5" /> Race Revenue</p>
                      <p className="text-lg font-semibold">${Number(race?.total_revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Autonomous plays</h4>
                <div className="space-y-3">
                  {commandPresets.map((preset, index) => (
                    <motion.div
                      key={preset.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-xl border border-border/60 bg-secondary/30 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{preset.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => triggerCommand(preset.command, preset.label)}
                        disabled={isThinking}
                        variant="outline"
                        className="w-full border-primary/30 bg-background/40 text-foreground hover:bg-primary/10"
                      >
                        Trigger play
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
