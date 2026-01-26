import { Store, ExternalLink, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreCardProps {
  name: string;
  domain: string;
  revenue: string;
  products: number;
  status: "active" | "idle" | "offline";
  growth: string;
}

export const StoreCard = ({
  name,
  domain,
  revenue,
  products,
  status,
  growth,
}: StoreCardProps) => {
  return (
    <div className="glass rounded-xl p-5 hover:bg-card/80 transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <Store className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {domain}
              <ExternalLink className="w-3 h-3" />
            </p>
          </div>
        </div>
        <div className={cn("status-dot", {
          "status-active": status === "active",
          "status-idle": status === "idle",
          "status-offline": status === "offline",
        })} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <p className="text-sm font-semibold">{revenue}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Products</p>
          <p className="text-sm font-semibold flex items-center gap-1">
            <Package className="w-3 h-3" />
            {products}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Growth</p>
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {growth}
          </p>
        </div>
      </div>
    </div>
  );
};
