import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganicCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  target_markets: string[];
  target_platforms: string[];
  content_strategy: Record<string, any> | null;
  generated_content: Array<{
    id: string;
    type: string;
    platform: string;
    content: string;
    status: string;
    scheduled_at?: string;
    published_at?: string;
  }>;
  posts_scheduled: number;
  posts_published: number;
  total_reach: number;
  total_engagement: number;
  leads_generated: number;
  revenue_attributed: number;
  status: string;
  assigned_agent: string | null;
  started_at: string;
  ended_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export const useOrganicCampaigns = (status?: string) => {
  return useQuery({
    queryKey: ["organic_campaigns", status],
    queryFn: async () => {
      let query = supabase
        .from("organic_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OrganicCampaign[];
    },
  });
};

export const useCreateOrganicCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Partial<OrganicCampaign>) => {
      const { data, error } = await supabase
        .from("organic_campaigns")
        .insert([campaign as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organic_campaigns"] });
    },
  });
};

export const useUpdateOrganicCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<OrganicCampaign>;
    }) => {
      const { data, error } = await supabase
        .from("organic_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organic_campaigns"] });
    },
  });
};

export const useCampaignStats = () => {
  return useQuery({
    queryKey: ["campaign_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organic_campaigns")
        .select("*");

      if (error) throw error;

      const campaigns = data as OrganicCampaign[];

      return {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        totalReach: campaigns.reduce((sum, c) => sum + c.total_reach, 0),
        totalEngagement: campaigns.reduce((sum, c) => sum + c.total_engagement, 0),
        totalLeads: campaigns.reduce((sum, c) => sum + c.leads_generated, 0),
        totalRevenue: campaigns.reduce((sum, c) => sum + Number(c.revenue_attributed), 0),
        postsPublished: campaigns.reduce((sum, c) => sum + c.posts_published, 0),
        postsScheduled: campaigns.reduce((sum, c) => sum + c.posts_scheduled, 0),
      };
    },
  });
};
