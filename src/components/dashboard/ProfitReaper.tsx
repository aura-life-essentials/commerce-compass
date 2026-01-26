import { useState, useEffect } from "react";
import { 
  Skull, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Zap, 
  ArrowUpRight,
  RefreshCw,
  Target,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import profitReaperAvatar from "@/assets/profit-reaper-avatar.jpg";

interface ProfitMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

const PROFIT_MARGIN = 0.67; // 67% profit margin

export const ProfitReaper = () => {
  const [isActive, setIsActive] = useState(true);
  const [productsProcessed, setProductsProcessed] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [reapingProgress, setReapingProgress] = useState(0);

  // Simulate live profit reaping
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setProductsProcessed(prev => prev + Math.floor(Math.random() * 3) + 1);
      setTotalProfit(prev => prev + Math.random() * 50 + 10);
      setReapingProgress(prev => (prev + 2) % 100);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  const metrics: ProfitMetric[] = [
    { 
      label: "Products Sourced", 
      value: productsProcessed.toString(), 
      change: "+12/hr", 
      trend: "up" 
    },
    { 
      label: "Profit Margin", 
      value: "67%", 
      change: "Fixed", 
      trend: "neutral" 
    },
    { 
      label: "Total Profit", 
      value: `$${totalProfit.toFixed(2)}`, 
      change: "+$847 today", 
      trend: "up" 
    },
    { 
      label: "Active Stores", 
      value: "4", 
      change: "All synced", 
      trend: "neutral" 
    },
  ];

  const calculateCustomerPrice = (cost: number, shippingCost: number) => {
    const totalCost = cost + shippingCost;
    return totalCost * (1 + PROFIT_MARGIN);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Hero Header with Avatar */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={profitReaperAvatar} 
          alt="Profit Reaper" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        
        {/* Floating Title */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-emerald-500/30 to-red-500/30",
              "border border-emerald-500/30",
              isActive && "animate-pulse"
            )}>
              <Skull className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
                Profit Reaper
                {isActive && (
                  <span className="flex items-center gap-1 text-xs font-normal text-emerald-400">
                    <Zap className="w-3 h-3" />
                    ACTIVE
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Autonomous 67% Margin Optimizer
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsActive(!isActive)}
          className="absolute top-4 right-4 gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isActive && "animate-spin")} />
          {isActive ? "Pause" : "Resume"}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, idx) => (
            <div 
              key={metric.label}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-all"
            >
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-xl font-bold">{metric.value}</p>
              <p className={cn(
                "text-xs flex items-center gap-1",
                metric.trend === "up" && "text-emerald-400",
                metric.trend === "down" && "text-red-400",
                metric.trend === "neutral" && "text-muted-foreground"
              )}>
                {metric.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* Reaping Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Product Sourcing Pipeline
            </span>
            <span className="text-sm text-muted-foreground">{reapingProgress}%</span>
          </div>
          <Progress value={reapingProgress} className="h-2" />
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
            Auto-applied to all CJ Dropshipping products across connected stores
          </p>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Recent Profit Events
          </h4>
          <div className="space-y-2">
            {[
              { product: "Wireless Earbuds Pro", cost: 12.50, profit: 8.38 },
              { product: "Smart Watch Band", cost: 8.20, profit: 5.49 },
              { product: "LED Desk Lamp", cost: 15.80, profit: 10.59 },
            ].map((event, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.product}</p>
                    <p className="text-xs text-muted-foreground">
                      Cost: ${event.cost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    +${event.profit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
