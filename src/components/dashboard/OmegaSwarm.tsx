import { useState, useEffect } from "react";
import { 
  Infinity, 
  Cpu, 
  Activity, 
  Network, 
  Zap,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Play,
  Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import omegaSwarmImg from "@/assets/omega-swarm.jpg";

interface SwarmAgent {
  id: string;
  name: string;
  type: "processor" | "analyzer" | "optimizer" | "syncer";
  status: "active" | "idle" | "processing";
  tasksCompleted: number;
  currentTask?: string;
}

interface SwarmMetrics {
  totalTasks: number;
  completedTasks: number;
  activeAgents: number;
  efficiency: number;
}

export const OmegaSwarm = () => {
  const [isSwarmActive, setIsSwarmActive] = useState(true);
  const [swarmPhase, setSwarmPhase] = useState<"idle" | "gathering" | "processing" | "optimizing">("processing");
  
  const [agents, setAgents] = useState<SwarmAgent[]>([
    { id: "ω-01", name: "Data Harvester", type: "processor", status: "active", tasksCompleted: 234, currentTask: "Syncing product catalog" },
    { id: "ω-02", name: "Price Oracle", type: "analyzer", status: "processing", tasksCompleted: 189, currentTask: "Analyzing competitor prices" },
    { id: "ω-03", name: "Margin Guardian", type: "optimizer", status: "active", tasksCompleted: 312, currentTask: "Optimizing profit margins" },
    { id: "ω-04", name: "Sync Sentinel", type: "syncer", status: "idle", tasksCompleted: 156 },
    { id: "ω-05", name: "Inventory Watcher", type: "processor", status: "active", tasksCompleted: 278, currentTask: "Monitoring stock levels" },
    { id: "ω-06", name: "Order Executor", type: "syncer", status: "processing", tasksCompleted: 421, currentTask: "Processing order queue" },
  ]);

  const [metrics, setMetrics] = useState<SwarmMetrics>({
    totalTasks: 1590,
    completedTasks: 1423,
    activeAgents: 4,
    efficiency: 94.2,
  });

  // Simulate swarm activity
  useEffect(() => {
    if (!isSwarmActive) return;

    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.3 ? "active" : Math.random() > 0.5 ? "processing" : "idle",
        tasksCompleted: agent.tasksCompleted + (Math.random() > 0.5 ? 1 : 0),
      })));

      setMetrics(prev => ({
        ...prev,
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 3),
        efficiency: Math.min(99.9, prev.efficiency + (Math.random() - 0.3) * 0.5),
      }));

      // Cycle through phases
      setSwarmPhase(prev => {
        const phases: typeof swarmPhase[] = ["gathering", "processing", "optimizing"];
        const currentIdx = phases.indexOf(prev);
        return phases[(currentIdx + 1) % phases.length] || "processing";
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSwarmActive]);

  const getAgentIcon = (type: SwarmAgent["type"]) => {
    switch (type) {
      case "processor": return Cpu;
      case "analyzer": return Activity;
      case "optimizer": return Zap;
      case "syncer": return Network;
      default: return Cpu;
    }
  };

  const getStatusColor = (status: SwarmAgent["status"]) => {
    switch (status) {
      case "active": return "text-emerald-400 bg-emerald-500/20";
      case "processing": return "text-blue-400 bg-blue-500/20 animate-pulse";
      case "idle": return "text-amber-400 bg-amber-500/20";
    }
  };

  const completionRate = (metrics.completedTasks / metrics.totalTasks) * 100;

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Hero Header with Swarm Visual */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={omegaSwarmImg} 
          alt="Omega Swarm" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
        
        {/* Floating Title */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
                "border border-cyan-500/30",
                isSwarmActive && "animate-pulse"
              )}>
                <Infinity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-gradient">Omega Swarm</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    isSwarmActive ? "bg-cyan-500/20 text-cyan-400" : "bg-muted text-muted-foreground"
                  )}>
                    {isSwarmActive ? swarmPhase.toUpperCase() : "PAUSED"}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Distributed Agent Network • {agents.length} Units
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSwarmActive(!isSwarmActive)}
              className="gap-2"
            >
              {isSwarmActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSwarmActive ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Swarm Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-lg font-bold">{metrics.totalTasks.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-bold text-emerald-400">{metrics.completedTasks.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Active Agents</p>
            <p className="text-lg font-bold text-cyan-400">
              {agents.filter(a => a.status !== "idle").length}/{agents.length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Efficiency</p>
            <p className="text-lg font-bold">{metrics.efficiency.toFixed(1)}%</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Swarm Progress</span>
            <span className="text-sm text-muted-foreground">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.type);
            return (
              <div 
                key={agent.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  "bg-secondary/30 hover:bg-secondary/50",
                  agent.status === "processing" && "border-blue-500/30",
                  agent.status === "active" && "border-emerald-500/20",
                  agent.status === "idle" && "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    getStatusColor(agent.status)
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{agent.id}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        agent.status === "active" && "bg-emerald-500",
                        agent.status === "processing" && "bg-blue-500 animate-pulse",
                        agent.status === "idle" && "bg-amber-500"
                      )} />
                    </div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    {agent.currentTask && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {agent.currentTask}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{agent.tasksCompleted}</p>
                    <p className="text-xs text-muted-foreground">tasks</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Swarm Status Footer */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">All agents synchronized</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Last sync: just now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
