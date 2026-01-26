import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type RevenueMetric = Tables<"revenue_metrics">;
export type RevenueMetricInsert = TablesInsert<"revenue_metrics">;

export const useRevenueMetrics = (storeId?: string, days = 30) => {
  return useQuery({
    queryKey: ["revenue_metrics", storeId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let query = supabase
        .from("revenue_metrics")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });
      
      if (storeId) {
        query = query.eq("store_id", storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RevenueMetric[];
    },
  });
};

export const useAggregatedRevenue = () => {
  return useQuery({
    queryKey: ["aggregated_revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_metrics")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      
      // Aggregate by date across all stores
      const aggregated = (data || []).reduce((acc, metric) => {
        const date = metric.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            revenue: 0,
            orders: 0,
            organic: 0,
          };
        }
        acc[date].revenue += Number(metric.revenue) || 0;
        acc[date].orders += metric.orders_count || 0;
        acc[date].organic += metric.organic_traffic || 0;
        return acc;
      }, {} as Record<string, { date: string; revenue: number; orders: number; organic: number }>);
      
      return Object.values(aggregated).slice(-30);
    },
  });
};

export const useCreateRevenueMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metric: RevenueMetricInsert) => {
      const { data, error } = await supabase
        .from("revenue_metrics")
        .insert(metric)
        .select()
        .single();
      
      if (error) throw error;
      return data as RevenueMetric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["aggregated_revenue"] });
    },
  });
};
