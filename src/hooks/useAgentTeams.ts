import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface AgentTeam {
  id: string;
  team_number: number;
  team_name: string;
  team_type: string;
  niche: string;
  is_active: boolean;
  total_revenue: number;
  deals_closed: number;
  campaigns_run: number;
  performance_score: number;
  current_workflow: string;
  last_active_at: string;
}

export interface TeamAgent {
  id: string;
  agent_name: string;
  agent_type: string;
  agent_role: string;
  brain_template: string;
  is_active: boolean;
  performance_score: number;
  tasks_completed: number;
  revenue_generated: number;
  team_id: string;
  current_state: any;
  last_decision_at: string | null;
}

export const useAgentTeams = () => {
  return useQuery({
    queryKey: ["agent_teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_teams")
        .select("*")
        .order("team_number");
      if (error) throw error;
      return data as AgentTeam[];
    },
  });
};

export const useTeamAgents = (teamId?: string) => {
  return useQuery({
    queryKey: ["team_agents", teamId],
    queryFn: async () => {
      let query = supabase
        .from("agent_brains")
        .select("*")
        .not("team_id", "is", null)
        .order("agent_role");

      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TeamAgent[];
    },
  });
};

export const useSwarmStats = () => {
  return useQuery({
    queryKey: ["swarm_stats"],
    queryFn: async () => {
      const [teamsRes, agentsRes] = await Promise.all([
        supabase.from("agent_teams").select("*"),
        supabase.from("agent_brains").select("*").not("team_id", "is", null),
      ]);

      const teams = (teamsRes.data || []) as AgentTeam[];
      const agents = (agentsRes.data || []) as TeamAgent[];

      const byNiche = teams.reduce((acc, t) => {
        if (!acc[t.niche]) acc[t.niche] = { teams: 0, agents: 0, revenue: 0 };
        acc[t.niche].teams++;
        acc[t.niche].revenue += Number(t.total_revenue);
        return acc;
      }, {} as Record<string, { teams: number; agents: number; revenue: number }>);

      agents.forEach((a) => {
        const team = teams.find((t) => t.id === a.team_id);
        if (team && byNiche[team.niche]) byNiche[team.niche].agents++;
      });

      return {
        totalTeams: teams.length,
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.is_active).length,
        activeTeams: teams.filter((t) => t.is_active).length,
        totalRevenue: teams.reduce((s, t) => s + Number(t.total_revenue), 0),
        totalDeals: teams.reduce((s, t) => s + t.deals_closed, 0),
        byNiche,
        byRole: agents.reduce((acc, a) => {
          acc[a.agent_role] = (acc[a.agent_role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  });
};
