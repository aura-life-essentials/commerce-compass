import { Bot, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  role: string;
  status: "active" | "idle" | "processing";
  tasksCompleted: number;
  lastActive: string;
}

export const AgentCard = ({
  name,
  role,
  status,
  tasksCompleted,
  lastActive,
}: AgentCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
      <div className="relative">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
          status === "active" && "bg-emerald-500/20",
          status === "idle" && "bg-amber-500/20",
          status === "processing" && "bg-blue-500/20 animate-pulse"
        )}>
          <Bot className={cn(
            "w-5 h-5",
            status === "active" && "text-emerald-400",
            status === "idle" && "text-amber-400",
            status === "processing" && "text-blue-400"
          )} />
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          status === "active" && "bg-emerald-500",
          status === "idle" && "bg-amber-500",
          status === "processing" && "bg-blue-500 animate-pulse"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{name}</h4>
          {status === "processing" && (
            <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium">{tasksCompleted}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
          <Clock className="w-3 h-3" />
          {lastActive}
        </p>
      </div>
    </div>
  );
};
