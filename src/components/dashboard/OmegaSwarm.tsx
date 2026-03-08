import { useState } from "react";
import { 
  Infinity, Cpu, Activity, Network, Zap, CheckCircle, Clock, Play, Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import omegaSwarmImg from "@/assets/omega-swarm.jpg";

export const OmegaSwarm = () => {
  const [showAll, setShowAll] = useState(false);

  const { data: agentBrains, isLoading } = useQuery({
    queryKey: ["swarm-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_brains")
        .select("id, agent_name, agent_type, is_active, performance_score, tasks_completed, revenue_generated, team_id")
        .order("agent_name");
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  const totalAgents = agentBrains?.length || 0;
  const activeAgents = agentBrains?.filter(a => a.is_active).length || 0;
  const totalTasks = agentBrains?.reduce((sum, a) => sum + (a.tasks_completed || 0), 0) || 0;
  const avgPerformance = totalAgents > 0
    ? (agentBrains?.reduce((sum, a) => sum + (a.performance_score || 0), 0) || 0) / totalAgents
    : 0;

  // Group by team type
  const typeBreakdown = agentBrains?.reduce((acc, a) => {
    acc[a.agent_type] = (acc[a.agent_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const displayAgents = showAll ? agentBrains : agentBrains?.slice(0, 8);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, typeof Cpu> = {
      omega_swarm: Infinity, profit_reaper: Zap, viral_hunter: Activity,
      content_creator: Network, traffic_generator: Cpu, global_expander: Network,
    };
    return icons[type] || Cpu;
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Hero Header */}
      <div className="relative h-40 overflow-hidden">
        <img src={omegaSwarmImg} alt="Omega Swarm" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-cyan-500/30">
                <Infinity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-gradient">Omega Swarm</span>
                  <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                    {activeAgents}/{totalAgents} ACTIVE
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real agents from database • {totalAgents} registered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Real Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Total Agents</p>
            <p className="text-lg font-bold">{totalAgents}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-lg font-bold text-emerald-400">{activeAgents}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Tasks Done</p>
            <p className="text-lg font-bold text-cyan-400">{totalTasks}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Avg Performance</p>
            <p className="text-lg font-bold">{avgPerformance.toFixed(1)}%</p>
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-xs capitalize">
              {type.replace("_", " ")}: {count}
            </Badge>
          ))}
        </div>

        {/* Agent List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {displayAgents?.map((agent) => {
                const Icon = getTypeIcon(agent.agent_type);
                return (
                  <div key={agent.id} className="p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        agent.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.agent_name}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance_score || 0} className="h-1 flex-1" />
                          <span className="text-xs text-muted-foreground">{(agent.performance_score || 0).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalAgents > 8 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3"
              >
                {showAll ? "Show Less" : `Show All ${totalAgents} Agents`}
              </Button>
            )}
          </>
        )}

        {/* Status Footer */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Data source: agent_brains table ({totalAgents} rows)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
