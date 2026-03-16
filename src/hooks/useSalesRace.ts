import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalesRace {
  id: string;
  title: string;
  command_text: string | null;
  target_amount: number;
  currency: string;
  status: string;
  objective: string;
  started_at: string | null;
  completed_at: string | null;
  winning_agent_name: string | null;
  winning_revenue: number;
  total_revenue: number;
  total_orders: number;
  connected_store_count: number;
  connected_product_count: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SalesRaceAgent {
  id: string;
  sales_race_id: string;
  agent_brain_id: string | null;
  agent_name: string;
  agent_role: string | null;
  agent_type: string | null;
  lane_number: number;
  status: string;
  target_amount: number;
  revenue_generated: number;
  orders_count: number;
  conversion_rate: number;
  avg_order_value: number;
  outreach_count: number;
  campaigns_launched: number;
  products_pitched: number;
  last_action_at: string | null;
  fastest_sale_at: string | null;
  rank_position: number | null;
  is_winner: boolean;
  metadata: Record<string, any>;
}

export interface SalesRaceEvent {
  id: string;
  sales_race_id: string;
  sales_race_agent_id: string | null;
  agent_brain_id: string | null;
  event_type: string;
  event_label: string;
  status: string;
  revenue_delta: number;
  order_delta: number;
  details: Record<string, any>;
  created_at: string;
}

export const useLatestSalesRace = () => {
  return useQuery({
    queryKey: ["sales-race", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_races")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as SalesRace | null) ?? null;
    },
    refetchInterval: 5000,
  });
};

export const useSalesRaceAgents = (salesRaceId?: string | null, limit = 100) => {
  return useQuery({
    queryKey: ["sales-race-agents", salesRaceId, limit],
    enabled: !!salesRaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_race_agents")
        .select("*")
        .eq("sales_race_id", salesRaceId)
        .order("rank_position", { ascending: true })
        .order("revenue_generated", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as SalesRaceAgent[]) || [];
    },
    refetchInterval: 4000,
  });
};

export const useSalesRaceEvents = (salesRaceId?: string | null, limit = 50) => {
  return useQuery({
    queryKey: ["sales-race-events", salesRaceId, limit],
    enabled: !!salesRaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_race_events")
        .select("*")
        .eq("sales_race_id", salesRaceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as SalesRaceEvent[]) || [];
    },
    refetchInterval: 4000,
  });
};

export const useRealtimeSalesRaceEvents = (salesRaceId?: string | null) => {
  const [events, setEvents] = useState<SalesRaceEvent[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!salesRaceId) {
      setEvents([]);
      return;
    }

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("sales_race_events")
        .select("*")
        .eq("sales_race_id", salesRaceId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setEvents(data as SalesRaceEvent[]);
    };

    fetchInitial();

    const channel = supabase
      .channel(`sales_race_events_${salesRaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales_race_events",
          filter: `sales_race_id=eq.${salesRaceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [payload.new as SalesRaceEvent, ...prev].slice(0, 20));
          }
          if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((event) => (event.id === (payload.new as SalesRaceEvent).id ? (payload.new as SalesRaceEvent) : event))
            );
          }
          if (payload.eventType === "DELETE") {
            setEvents((prev) => prev.filter((event) => event.id !== (payload.old as { id: string }).id));
          }
          queryClient.invalidateQueries({ queryKey: ["sales-race-events", salesRaceId] });
          queryClient.invalidateQueries({ queryKey: ["sales-race-agents", salesRaceId] });
          queryClient.invalidateQueries({ queryKey: ["sales-race", "latest"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salesRaceId, queryClient]);

  return events;
};

export const useLaunchSalesRace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (command: string) => {
      const response = await supabase.functions.invoke("ceo-brain", {
        body: {
          action: "command",
          command,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-race", "latest"] });
      queryClient.invalidateQueries({ queryKey: ["sales-race-agents"] });
      queryClient.invalidateQueries({ queryKey: ["sales-race-events"] });
      queryClient.invalidateQueries({ queryKey: ["agent-brains"] });
      queryClient.invalidateQueries({ queryKey: ["ai-decisions"] });
      queryClient.invalidateQueries({ queryKey: ["agent_logs"] });
      queryClient.invalidateQueries({ queryKey: ["ceo-metrics"] });
    },
  });
};
