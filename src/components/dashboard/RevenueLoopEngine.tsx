import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Magnet, Target, Package, TrendingUp, RefreshCw, Activity, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LoopStage {
  key: string;
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
  description: string;
}

export function RevenueLoopEngine() {
  const { data: healthData } = useQuery({
    queryKey: ["self-healing-status"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return null;

      const res = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/system-health-autofix`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 60000,
    retry: false,
  });

  const loop = healthData?.revenue_loop || { attract: 0, convert: 0, fulfill: 0, expand: 0 };
  const systemStatus = healthData?.status || "unknown";
  const healedCount = healthData?.healed || 0;

  const stages: LoopStage[] = [
    { key: "attract", label: "ATTRACT", icon: Magnet, count: loop.attract, color: "text-blue-400", description: "Leads entering funnel" },
    { key: "convert", label: "CONVERT", icon: Target, count: loop.convert, color: "text-amber-400", description: "Qualifying & closing" },
    { key: "fulfill", label: "FULFILL", icon: Package, count: loop.fulfill, color: "text-emerald-400", description: "Orders completed" },
    { key: "expand", label: "EXPAND", icon: TrendingUp, count: loop.expand, color: "text-purple-400", description: "Active subscriptions" },
  ];

  return (
    <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: "8s" }} />
            Revenue Loop Engine
          </CardTitle>
          <div className="flex items-center gap-2">
            {healedCount > 0 && (
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">
                {healedCount} auto-healed
              </Badge>
            )}
            <Badge
              variant="outline"
              className={systemStatus === "healthy"
                ? "border-emerald-500/40 text-emerald-400"
                : systemStatus === "degraded"
                ? "border-red-500/40 text-red-400"
                : "border-muted-foreground/40 text-muted-foreground"}
            >
              <Shield className="h-3 w-3 mr-1" />
              {systemStatus === "healthy" ? "All Systems GO" : systemStatus === "degraded" ? "Degraded" : "Checking..."}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Revenue loop visualization */}
        <div className="flex items-center justify-between gap-1">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-1 flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 rounded-lg border border-border/50 bg-background/50 p-3 text-center"
              >
                <stage.icon className={`h-5 w-5 mx-auto mb-1 ${stage.color}`} />
                <div className="text-xs font-bold tracking-wider text-muted-foreground">{stage.label}</div>
                <div className={`text-2xl font-black ${stage.color}`}>{stage.count}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{stage.description}</div>
              </motion.div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
            </div>
          ))}
          {/* Loop arrow back */}
          <div className="flex items-center shrink-0">
            <ArrowRight className="h-4 w-4 text-primary/60" />
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>
        </div>

        {/* Self-healing status */}
        {healthData?.actions && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {["stripe", "agents", "fulfillment", "secrets"].map(sub => {
              const action = healthData.actions.find((a: any) => a.subsystem === sub);
              if (!action) return null;
              return (
                <div key={sub} className="rounded border border-border/30 bg-background/30 px-2 py-1.5 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{sub}</div>
                  <div className={`text-xs font-semibold ${
                    action.severity === "ok" ? "text-emerald-400" :
                    action.severity === "warn" ? "text-amber-400" : "text-red-400"
                  }`}>
                    {action.severity === "ok" ? "✓ Healthy" : action.severity === "warn" ? "⚡ Healed" : "✗ Issue"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
