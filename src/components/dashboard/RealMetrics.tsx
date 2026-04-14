import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, Bot, Zap, Brain, Package, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface RealStats {
  totalAgents: number;
  activeAgents: number;
  totalDecisions: number;
  totalLogs: number;
  totalOrders: number;
  totalStripeRevenue: number;
  shopifyProducts: number;
}

export const RealMetrics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["real-metrics-stats"],
    queryFn: async () => {
      const [agents, decisions, logs, orders, stripeTransactions] = await Promise.all([
        supabase.from("agent_brains").select("is_active", { count: "exact" }),
        supabase.from("ai_decisions").select("id", { count: "exact" }),
        supabase.from("agent_logs").select("id", { count: "exact" }),
        supabase.from("orders").select("total_amount", { count: "exact" }),
        supabase.from("stripe_transactions").select("amount, status"),
      ]);

      const activeAgents = agents.data?.filter(a => a.is_active).length || 0;
      const totalStripeRevenue = stripeTransactions.data
        ?.filter(t => t.status === 'succeeded')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalAgents: agents.count || 0,
        activeAgents,
        totalDecisions: decisions.count || 0,
        totalLogs: logs.count || 0,
        totalOrders: orders.count || 0,
        totalStripeRevenue,
        shopifyProducts: 0,
      } as RealStats;
    },
    refetchInterval: 30000,
  });

  const { data: shopifyProducts } = useShopifyProducts(50);

  const metrics = [
    {
      label: "Real Revenue",
      value: `$${(stats?.totalStripeRevenue || 0).toFixed(2)}`,
      detail: stats?.totalOrders ? `${stats.totalOrders} orders` : "No orders yet",
      icon: DollarSign,
      color: stats?.totalStripeRevenue ? "text-emerald-400" : "text-amber-400",
      isReal: (stats?.totalStripeRevenue || 0) > 0,
    },
    {
      label: "Shopify Products",
      value: (shopifyProducts?.length || 0).toString(),
      detail: "Live on store",
      icon: Package,
      color: "text-cyan-400",
      isReal: true,
    },
    {
      label: "AI Agents",
      value: `${stats?.activeAgents || 0}/${stats?.totalAgents || 0}`,
      detail: "Active in database",
      icon: Bot,
      color: "text-blue-400",
      isReal: true,
    },
    {
      label: "AI Decisions",
      value: (stats?.totalDecisions || 0).toString(),
      detail: `${stats?.totalLogs || 0} logged actions`,
      icon: Brain,
      color: "text-purple-400",
      isReal: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Truth Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">Real Data Only</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Every number below comes directly from your database, Shopify store, and Stripe. No simulations.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="glass rounded-xl p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <Badge
                  variant="outline"
                  className={metric.isReal ? "text-emerald-400 border-emerald-500/30 text-xs" : "text-amber-400 border-amber-500/30 text-xs"}
                >
                  {metric.isReal ? "LIVE" : "PENDING"}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{isLoading ? "..." : metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              <p className="text-xs text-muted-foreground">{metric.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
