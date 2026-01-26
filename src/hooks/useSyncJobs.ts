import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type SyncJob = Tables<"sync_jobs">;
export type SyncJobInsert = TablesInsert<"sync_jobs">;

export const useSyncJobs = (storeId?: string) => {
  return useQuery({
    queryKey: ["sync_jobs", storeId],
    queryFn: async () => {
      let query = supabase
        .from("sync_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (storeId) {
        query = query.eq("store_id", storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SyncJob[];
    },
  });
};

export const useActiveSyncJobs = () => {
  return useQuery({
    queryKey: ["active_sync_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_jobs")
        .select("*, stores(name, domain)")
        .in("status", ["pending", "running"])
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for active jobs
  });
};

export const useCreateSyncJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: SyncJobInsert) => {
      const { data, error } = await supabase
        .from("sync_jobs")
        .insert({
          ...job,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SyncJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync_jobs"] });
      queryClient.invalidateQueries({ queryKey: ["active_sync_jobs"] });
    },
  });
};

export const useUpdateSyncJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SyncJob> & { id: string }) => {
      const { data, error } = await supabase
        .from("sync_jobs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as SyncJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync_jobs"] });
      queryClient.invalidateQueries({ queryKey: ["active_sync_jobs"] });
    },
  });
};
