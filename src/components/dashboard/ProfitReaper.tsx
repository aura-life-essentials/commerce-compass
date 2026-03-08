import { 
  Skull, DollarSign, TrendingUp, Package, Zap, ArrowUpRight, Target, Flame, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Skeleton } from "@/components/ui/skeleton";
import profitReaperAvatar from "@/assets/profit-reaper-avatar.jpg";

export const ProfitReaper = () => {
  // Real data from database
  const { data: orderStats, isLoading: ordersLoading } = useQuery({
    queryKey: ["profit-reaper-orders"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("orders")
        .select("total_amount, subtotal, created_at", { count: "exact" });
      if (error) throw error;
      const totalRevenue = data?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      return { totalRevenue, orderCount: count || 0 };
    },
    refetchInterval: 30000,
  });

  const { data: stripeStats } = useQuery({
    queryKey: ["profit-reaper-stripe"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stripe_transactions")
        .select("amount, status");
      if (error) throw error;
      const succeeded = data?.filter(t => t.status === 'succeeded') || [];
      const totalRevenue = succeeded.reduce((sum, t) => sum + Number(t.amount), 0);
      return { totalRevenue, transactionCount: succeeded.length };
    },
    refetchInterval: 30000,
  });

  const { data: shopifyProducts } = useShopifyProducts(50);

  const realRevenue = (orderStats?.totalRevenue || 0) + (stripeStats?.totalRevenue || 0);
  const realProfit = realRevenue * 0.67;
  const productCount = shopifyProducts?.length || 0;

  const metrics = [
    { 
      label: "Shopify Products", 
      value: productCount.toString(), 
      detail: "Live on store",
      isReal: true,
    },
    { 
      label: "Profit Margin", 
      value: "67%", 
      detail: "Target (if selling)",
      isReal: true,
    },
    { 
      label: "Total Revenue", 
      value: `$${realRevenue.toFixed(2)}`, 
      detail: realRevenue > 0 ? "From real orders" : "No sales yet",
      isReal: realRevenue > 0,
    },
    { 
      label: "Est. Profit", 
      value: `$${realProfit.toFixed(2)}`, 
      detail: realProfit > 0 ? "@ 67% margin" : "No profit yet",
      isReal: realProfit > 0,
    },
  ];

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Hero Header with Avatar */}
      <div className="relative h-48 overflow-hidden">
        <img src={profitReaperAvatar} alt="Profit Reaper" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/30 to-red-500/30 border border-emerald-500/30">
              <Skull className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
                Profit Reaper
                <Badge variant="outline" className={cn(
                  "text-xs",
                  realRevenue > 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                  {realRevenue > 0 ? "EARNING" : "STANDBY"}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">Real revenue tracking — no fake numbers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Truth Notice */}
        {realRevenue === 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-400">
              No real sales recorded yet. Revenue will appear here once actual Stripe payments or Shopify orders come through.
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-all">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-xl font-bold">{ordersLoading ? "..." : metric.value}</p>
              <p className={cn(
                "text-xs",
                metric.isReal ? "text-emerald-400" : "text-muted-foreground"
              )}>
                {metric.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Formula */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <h4 className="font-semibold">Profit Formula</h4>
          </div>
          <div className="font-mono text-sm bg-background/50 p-3 rounded-md">
            <span className="text-emerald-400">customerPrice</span>
            <span className="text-muted-foreground"> = </span>
            <span className="text-cyan-400">(productCost + shippingCost)</span>
            <span className="text-muted-foreground"> × </span>
            <span className="text-orange-400">1.67</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Applied when products are sourced and listed
          </p>
        </div>
      </div>
    </div>
  );
};
