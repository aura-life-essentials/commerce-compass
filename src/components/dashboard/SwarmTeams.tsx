import { useState } from "react";
import { useAgentTeams, useTeamAgents, useSwarmStats } from "@/hooks/useAgentTeams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Bot, Brain, Zap, Target, DollarSign, TrendingUp,
  ChevronDown, ChevronUp, Play, Loader2, Sparkles, Shield,
  Palette, Heart, Home, Cpu, Briefcase, Rocket
} from "lucide-react";

const nicheIcons: Record<string, typeof Heart> = {
  beauty: Palette, health: Heart, home: Home, tech: Cpu, office: Briefcase, cutting_edge: Rocket, general: Zap,
};
const nicheColors: Record<string, string> = {
  beauty: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  health: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  home: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  tech: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  office: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  cutting_edge: "from-red-500/20 to-orange-500/20 border-red-500/30",
  general: "from-gray-500/20 to-slate-500/20 border-gray-500/30",
};
const roleLabels: Record<string, string> = {
  team_lead: "🎯 Lead", content_creator: "✍️ Content", marketer: "📢 Marketer", closer: "💰 Closer", analyst: "📊 Analyst",
};

export const SwarmTeams = () => {
  const { data: teams, isLoading: teamsLoading } = useAgentTeams();
  const { data: allAgents } = useTeamAgents();
  const { data: stats } = useSwarmStats();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [deployingTeam, setDeployingTeam] = useState<string | null>(null);
  const [filterNiche, setFilterNiche] = useState<string>("all");

  const deployTeam = async (teamId: string, teamName: string) => {
    setDeployingTeam(teamId);
    toast.loading(`Deploying ${teamName}...`);
    try {
      const teamAgents = allAgents?.filter((a) => a.team_id === teamId) || [];
      for (const agent of teamAgents) {
        await supabase.functions.invoke("autonomous-brain", {
          body: { action: "think", agent_type: agent.agent_type, context: { team: teamName, role: agent.agent_role, timestamp: Date.now() } },
        });
      }
      toast.dismiss();
      toast.success(`${teamName} deployed!`, { description: `${teamAgents.length} agents thinking autonomously` });
    } catch (e) {
      toast.dismiss();
      toast.error("Deploy failed", { description: (e as Error).message });
    }
    setDeployingTeam(null);
  };

  const filteredTeams = filterNiche === "all" ? teams : teams?.filter((t) => t.niche === filterNiche);
  const niches = ["all", ...new Set(teams?.map((t) => t.niche) || [])];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-red-500/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Swarm Teams Command</h3>
            <p className="text-sm text-muted-foreground">
              {stats?.totalAgents || 0} agents • {stats?.totalTeams || 0} teams • Full autonomous sales
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-3 py-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse inline-block" />
          {stats?.activeAgents || 0} Online
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Agents", value: stats?.totalAgents || 0, icon: Bot, color: "text-blue-400" },
          { label: "Active Teams", value: stats?.activeTeams || 0, icon: Shield, color: "text-emerald-400" },
          { label: "Revenue", value: `$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-amber-400" },
          { label: "Deals Closed", value: stats?.totalDeals || 0, icon: Target, color: "text-pink-400" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-secondary/50 text-center">
            <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Role Breakdown */}
      {stats?.byRole && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {roleLabels[role] || role} × {count}
            </Badge>
          ))}
        </div>
      )}

      {/* Niche Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {niches.map((n) => (
          <Button
            key={n}
            size="sm"
            variant={filterNiche === n ? "default" : "outline"}
            onClick={() => setFilterNiche(n)}
            className="text-xs capitalize whitespace-nowrap"
          >
            {n === "all" ? "All Niches" : n.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Teams Grid */}
      {teamsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
          {filteredTeams?.map((team) => {
            const NicheIcon = nicheIcons[team.niche] || Zap;
            const colors = nicheColors[team.niche] || nicheColors.general;
            const teamAgents = allAgents?.filter((a) => a.team_id === team.id) || [];
            const isExpanded = expandedTeam === team.id;
            const isDeploying = deployingTeam === team.id;

            return (
              <motion.div
                key={team.id}
                layout
                className={cn("rounded-xl border bg-gradient-to-br p-3 transition-all", colors)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <NicheIcon className="w-4 h-4" />
                    <span className="font-medium text-sm">{team.team_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      #{team.team_number}
                    </Badge>
                    <button onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Bot className="w-3 h-3" />{teamAgents.length}</span>
                  <span className="capitalize">{team.niche.replace("_", " ")}</span>
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px]", 
                    team.current_workflow === "idle" ? "bg-muted" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {team.current_workflow}
                  </span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 mt-2 pt-2 border-t border-white/10">
                        {teamAgents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-black/20">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1.5 h-1.5 rounded-full", agent.is_active ? "bg-emerald-500" : "bg-muted-foreground")} />
                              <span>{roleLabels[agent.agent_role] || agent.agent_role}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Brain className="w-3 h-3" />
                              <span className="capitalize text-[10px]">{agent.brain_template}</span>
                              <span className="text-[10px]">{agent.performance_score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2 text-xs h-7"
                        onClick={() => deployTeam(team.id, team.team_name)}
                        disabled={isDeploying}
                      >
                        {isDeploying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                        Deploy Team
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20">
        <p className="text-sm font-medium mb-1">⚡ 200-Agent Autonomous Sales Network</p>
        <p className="text-xs text-muted-foreground">
          40 teams × 5 agents each • Interchangeable brains (Strategic, Creative, Aggressive, Persuasive, Analytical) • Full sales cycle: Research → Content → Market → Close → Analyze
        </p>
      </div>
    </div>
  );
};
