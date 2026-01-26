import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type GovernanceEvent = Tables<"governance_events">;
export type GovernanceEventInsert = TablesInsert<"governance_events">;

export const useGovernanceEvents = (limit = 100) => {
  return useQuery({
    queryKey: ["governance_events", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as GovernanceEvent[];
    },
  });
};

export const useGovernanceStats = () => {
  return useQuery({
    queryKey: ["governance_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_events")
        .select("category, severity, resolved");
      
      if (error) throw error;
      
      const stats = {
        compliance: { passed: 0, warnings: 0, violations: 0 },
        security: { passed: 0, warnings: 0, violations: 0 },
        privacy: { passed: 0, warnings: 0, violations: 0 },
        ethics: { passed: 0, warnings: 0, violations: 0 },
      };
      
      (data || []).forEach((event) => {
        const category = event.category as keyof typeof stats;
        if (stats[category]) {
          if (event.resolved || event.severity === "info") {
            stats[category].passed++;
          } else if (event.severity === "warning") {
            stats[category].warnings++;
          } else {
            stats[category].violations++;
          }
        }
      });
      
      return stats;
    },
  });
};

export const useCreateGovernanceEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: GovernanceEventInsert) => {
      const { data, error } = await supabase
        .from("governance_events")
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data as GovernanceEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance_events"] });
      queryClient.invalidateQueries({ queryKey: ["governance_stats"] });
    },
  });
};

export const useResolveGovernanceEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("governance_events")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GovernanceEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance_events"] });
      queryClient.invalidateQueries({ queryKey: ["governance_stats"] });
    },
  });
};
