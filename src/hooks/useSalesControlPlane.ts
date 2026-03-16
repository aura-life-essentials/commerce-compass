import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalesControlPlaneSummary {
  totals: {
    revenue: number;
    stripeRevenue: number;
    orderRevenue: number;
    orders: number;
    stores: number;
    activeAgents: number;
    pendingDecisions: number;
    succeededStripeTransactions: number;
  };
  health: {
    avgOrderValue: number;
    pendingOrders: number;
    completedOrders: number;
    revenueDelta: number;
    autonomousReadiness: number;
  };
  salesRace: {
    id: string | null;
    title: string | null;
    status: string | null;
    targetAmount: number;
    totalRevenue: number;
    totalOrders: number;
    winningAgentName: string | null;
    progress: number;
    liveAgents: number;
  };
  stores: Array<{
    id: string;
    name: string;
    domain: string;
    status: string | null;
    currency: string | null;
    lastSyncedAt: string | null;
  }>;
  signals: {
    topSources: Array<{ source: string; events: number; revenue: number }>;
    recentAgentActions: Array<{ id: string; agentName: string; action: string; status: string | null; createdAt: string }>;
  };
}

export const useSalesControlPlane = () => {
  return useQuery({
    queryKey: ["sales-control-plane"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("sales-control-plane", {
        body: {},
      });

      if (error) throw error;
      return data as SalesControlPlaneSummary;
    },
    refetchInterval: 10000,
  });
};
