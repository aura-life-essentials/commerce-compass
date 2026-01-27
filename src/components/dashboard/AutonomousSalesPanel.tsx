import { useState } from "react";
import { 
  Rocket, 
  Store, 
  Package, 
  DollarSign,
  ArrowUpRight,
  Settings,
  Power,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ProductImportModal } from "./ProductImportModal";

interface SalesChannel {
  id: string;
  name: string;
  status: "connected" | "pending" | "error";
  revenue: number;
  products: number;
}

export const AutonomousSalesPanel = () => {
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const salesChannels: SalesChannel[] = [
    { id: "1", name: "Luxe Fashion", status: "connected", revenue: 12450, products: 234 },
    { id: "2", name: "Tech Gadgets", status: "connected", revenue: 8920, products: 156 },
    { id: "3", name: "Home Essentials", status: "pending", revenue: 5670, products: 89 },
    { id: "4", name: "Wellness Hub", status: "connected", revenue: 7340, products: 112 },
  ];

  const handleSyncAll = async () => {
    setIsSyncing(true);
    toast.loading("Syncing all stores with Aura Dropshipping...");
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSyncing(false);
    toast.dismiss();
    toast.success("All stores synced successfully!");
  };

  const totalRevenue = salesChannels.reduce((sum, ch) => sum + ch.revenue, 0);
  const totalProducts = salesChannels.reduce((sum, ch) => sum + ch.products, 0);

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Autonomous Sales Engine</h3>
            <p className="text-sm text-muted-foreground">Aura Dropshipping Integration</p>
          </div>
        </div>
        
        {/* Auto-Pilot Toggle */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
            isAutoPilot 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-muted border-border text-muted-foreground"
          )}>
            <Power className="w-4 h-4" />
            <span className="text-sm font-medium">Auto-Pilot</span>
            <Switch 
              checked={isAutoPilot} 
              onCheckedChange={setIsAutoPilot}
              className="ml-2"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +18.3% this month
          </p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Package className="w-4 h-4" />
            <span className="text-xs">Active Products</span>
          </div>
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">Across all stores</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Store className="w-4 h-4" />
            <span className="text-xs">Connected Stores</span>
          </div>
          <p className="text-2xl font-bold">{salesChannels.filter(s => s.status === "connected").length}</p>
          <p className="text-xs text-muted-foreground">of {salesChannels.length} total</p>
        </div>
      </div>

      {/* Channels List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Sales Channels</h4>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsImportModalOpen(true)}
              className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" />
              Import Products
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="gap-2"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Sync All
            </Button>
          </div>
        </div>
        
        {salesChannels.map((channel) => (
          <div 
            key={channel.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              channel.status === "connected" && "bg-emerald-500/20",
              channel.status === "pending" && "bg-amber-500/20",
              channel.status === "error" && "bg-red-500/20"
            )}>
              <Store className={cn(
                "w-5 h-5",
                channel.status === "connected" && "text-emerald-400",
                channel.status === "pending" && "text-amber-400",
                channel.status === "error" && "text-red-400"
              )} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{channel.name}</p>
                {channel.status === "connected" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {channel.status === "pending" && (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                )}
                {channel.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {channel.products} products • 67% margin active
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-sm">${channel.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">revenue</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <p className="text-sm font-medium mb-1">🔥 Profit Reaper Active</p>
        <p className="text-xs text-muted-foreground">
          All products automatically sourced from Aura Dropshipping with 67% profit margin applied to customer pricing.
        </p>
      </div>

      {/* Product Import Modal */}
      <ProductImportModal 
        open={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen} 
      />
    </div>
  );
};
