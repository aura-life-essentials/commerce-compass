import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Shield,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import heroImage from "@/assets/hero-command-center.jpg";

interface HeroBannerProps {
  onSeedData?: () => void;
  hasData?: boolean;
}

export const HeroBanner = ({ onSeedData, hasData }: HeroBannerProps) => {
  const { data: shopifyProducts } = useShopifyProducts(50);
  
  const { data: systemStatus } = useQuery({
    queryKey: ["hero-system-status"],
    queryFn: async () => {
      const [agentsRes, ordersRes, stripeRes] = await Promise.all([
        supabase.from("agent_brains").select("is_active", { count: "exact" }),
        supabase.from("orders").select("total_amount"),
        supabase.from("stripe_transactions").select("amount, status"),
      ]);

      const activeAgents = agentsRes.data?.filter(a => a.is_active).length || 0;
      const totalAgents = agentsRes.count || 0;
      const orderRevenue = ordersRes.data?.reduce((s, o) => s + Number(o.total_amount || 0), 0) || 0;
      const stripeRevenue = stripeRes.data?.filter(t => t.status === 'succeeded').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
      const totalRevenue = Math.max(orderRevenue, stripeRevenue);
      
      // System is "online" only if DB responded and we have agents
      const dbConnected = agentsRes.error === null;
      
      return { activeAgents, totalAgents, totalRevenue, dbConnected, productCount: shopifyProducts?.length || 0 };
    },
    refetchInterval: 30000,
  });

  const isOnline = systemStatus?.dbConnected === true;

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Command Center" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Autonomous Commerce Engine</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-gradient">CEO Brain</span>
            <br />
            <span className="text-foreground">Revenue Engine</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-6 max-w-lg">
            Unified commerce orchestration powered by AI agents. 
            Real-time Shopify, Stripe, and agent telemetry.
          </p>

          {/* Real Stats Row */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  ${((systemStatus?.totalRevenue || 0) / 100).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(systemStatus?.totalRevenue || 0) > 0 ? "Real Revenue" : "No Revenue Yet"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{systemStatus?.activeAgents || 0}/{systemStatus?.totalAgents || 0}</p>
                <p className="text-xs text-muted-foreground">Agents Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{shopifyProducts?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Shopify Products</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!hasData && onSeedData && (
              <Button onClick={onSeedData} size="lg" className="gap-2">
                <Zap className="w-4 h-4" />
                Initialize System
              </Button>
            )}
            <Button variant="outline" size="lg" className="gap-2">
              View Analytics
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* System Status - REAL */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
          isOnline 
            ? "bg-emerald-500/20 border-emerald-500/30" 
            : "bg-red-500/20 border-red-500/30"
        }`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className={`text-xs font-medium ${isOnline ? "text-emerald-400" : "text-red-400"}`}>
            {isOnline ? "DB Connected" : "DB Unreachable"}
          </span>
        </div>
      </div>
    </div>
  );
};
