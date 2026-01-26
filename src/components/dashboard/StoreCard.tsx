import { Store, ExternalLink, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface StoreCardProps {
  id: string;
  name: string;
  domain: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSynced?: string | null;
}

export const StoreCard = ({
  name,
  domain,
  status,
  lastSynced,
}: StoreCardProps) => {
  const statusConfig = {
    connected: { label: "Connected", color: "bg-emerald-500", dotClass: "status-active" },
    disconnected: { label: "Disconnected", color: "bg-red-500", dotClass: "status-offline" },
    syncing: { label: "Syncing", color: "bg-blue-500 animate-pulse", dotClass: "status-syncing" },
    error: { label: "Error", color: "bg-red-500", dotClass: "status-offline" },
  };

  const config = statusConfig[status] || statusConfig.disconnected;

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
        <div className={cn("w-3 h-3 rounded-full", config.color)} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {status === "syncing" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span>
            {lastSynced 
              ? `Synced ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`
              : "Never synced"
            }
          </span>
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-md",
          status === "connected" && "bg-emerald-500/10 text-emerald-400",
          status === "syncing" && "bg-blue-500/10 text-blue-400",
          status === "disconnected" && "bg-red-500/10 text-red-400",
          status === "error" && "bg-red-500/10 text-red-400",
        )}>
          {config.label}
        </span>
      </div>
    </div>
  );
};
