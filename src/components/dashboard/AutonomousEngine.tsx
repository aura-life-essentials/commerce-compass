import { useState, useEffect } from "react";
import { Brain, Globe, Video, TrendingUp, Zap, DollarSign, Loader2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentBrain {
  id: string;
  agent_name: string;
  agent_type: string;
  is_active: boolean;
  current_state: any;
  last_decision_at: string | null;
}

export const AutonomousEngine = () => {
  const [agents, setAgents] = useState<AgentBrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
    const channel = supabase
      .channel('agent_brains')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_brains' }, fetchAgents)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAgents = async () => {
    const { data } = await supabase.from("agent_brains").select("*").order("agent_name");
    if (data) setAgents(data as AgentBrain[]);
    setIsLoading(false);
  };

  const triggerAgent = async (agentType: string) => {
    setActiveAgent(agentType);
    toast.loading(`${agentType} is thinking...`);
    
    try {
      const { data, error } = await supabase.functions.invoke("autonomous-brain", {
        body: { action: "think", agent_type: agentType, context: { timestamp: Date.now() } }
      });
      
      toast.dismiss();
      if (error) throw error;
      toast.success(`${agentType} made a decision!`, { description: data?.decision?.action || "Processing..." });
    } catch (e) {
      toast.dismiss();
      toast.error("Agent failed", { description: (e as Error).message });
    }
    setActiveAgent(null);
  };

  const agentIcons: Record<string, typeof Brain> = {
    profit_reaper: DollarSign, omega_swarm: Zap, viral_hunter: Video,
    content_creator: Video, traffic_generator: TrendingUp, global_expander: Globe
  };

  const agentColors: Record<string, string> = {
    profit_reaper: "from-red-500/20 to-orange-500/20 text-red-400",
    omega_swarm: "from-blue-500/20 to-cyan-500/20 text-blue-400",
    viral_hunter: "from-pink-500/20 to-purple-500/20 text-pink-400",
    content_creator: "from-purple-500/20 to-indigo-500/20 text-purple-400",
    traffic_generator: "from-emerald-500/20 to-green-500/20 text-emerald-400",
    global_expander: "from-amber-500/20 to-yellow-500/20 text-amber-400"
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-cyan-500/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Autonomous AI Engine</h3>
            <p className="text-sm text-muted-foreground">Backend-triggered agents • Real execution logs</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
          agents.filter(a => a.is_active).length > 0 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : "bg-amber-500/10 border-amber-500/30"
        }`}>
          <div className={`w-2 h-2 rounded-full ${agents.filter(a => a.is_active).length > 0 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <span className={`text-sm font-medium ${agents.filter(a => a.is_active).length > 0 ? "text-emerald-400" : "text-amber-400"}`}>
            {agents.filter(a => a.is_active).length}/{agents.length} Active
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.agent_type] || Brain;
            const colors = agentColors[agent.agent_type] || "from-gray-500/20 to-slate-500/20 text-gray-400";
            const isThinking = activeAgent === agent.agent_type;
            
            return (
              <button
                key={agent.id}
                onClick={() => triggerAgent(agent.agent_type)}
                disabled={isThinking}
                className={cn(
                  "p-4 rounded-xl bg-gradient-to-br border border-white/5 transition-all hover:scale-[1.02] hover:border-white/10 text-left group",
                  colors
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-white/10", isThinking && "animate-pulse")}>
                    {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {agent.is_active ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="font-medium text-sm text-foreground">{agent.agent_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{agent.agent_type.replace("_", " ")}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
        <p className="text-sm font-medium mb-1">🧠 Agent Execution Engine</p>
        <p className="text-xs text-muted-foreground">
          Agents execute via backend functions only. Click any agent above to trigger a real execution cycle recorded in the database.
        </p>
      </div>
    </div>
  );
};
