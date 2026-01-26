import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type AgentLog = Tables<"agent_logs">;
export type AgentLogInsert = TablesInsert<"agent_logs">;

export const useAgentLogs = (storeId?: string, limit = 50) => {
  return useQuery({
    queryKey: ["agent_logs", storeId, limit],
    queryFn: async () => {
      let query = supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (storeId) {
        query = query.eq("store_id", storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AgentLog[];
    },
  });
};

export const useCreateAgentLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: AgentLogInsert) => {
      const { data, error } = await supabase
        .from("agent_logs")
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data as AgentLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent_logs"] });
    },
  });
};

export const useAgentStats = () => {
  return useQuery({
    queryKey: ["agent_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_logs")
        .select("agent_name, agent_role, status");
      
      if (error) throw error;
      
      // Aggregate stats by agent
      const stats = (data || []).reduce((acc, log) => {
        const key = log.agent_name;
        if (!acc[key]) {
          acc[key] = {
            name: log.agent_name,
            role: log.agent_role,
            tasksCompleted: 0,
            processing: 0,
          };
        }
        if (log.status === "completed") acc[key].tasksCompleted++;
        if (log.status === "processing") acc[key].processing++;
        return acc;
      }, {} as Record<string, { name: string; role: string; tasksCompleted: number; processing: number }>);
      
      return Object.values(stats);
    },
  });
};
