import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface AgentConversation {
  id: string;
  agent_name: string;
  agent_role: string;
  conversation_type: string;
  contact_type: string;
  contact_id: string | null;
  contact_email: string | null;
  contact_name: string | null;
  platform: string;
  channel: string | null;
  subject: string | null;
  messages: Array<{
    role: "agent" | "contact";
    content: string;
    timestamp: string;
  }>;
  sentiment: string;
  intent: string | null;
  outcome: string | null;
  deal_id: string | null;
  revenue_generated: number;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useAgentConversations = (agentName?: string, isActive?: boolean) => {
  return useQuery({
    queryKey: ["agent_conversations", agentName, isActive],
    queryFn: async () => {
      let query = supabase
        .from("agent_conversations")
        .select("*")
        .order("started_at", { ascending: false });

      if (agentName) {
        query = query.eq("agent_name", agentName);
      }

      if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as AgentConversation[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });
};

export const useActiveConversations = () => {
  return useAgentConversations(undefined, true);
};

export const useRealtimeAgentConversations = () => {
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("agent_conversations")
        .select("*")
        .eq("is_active", true)
        .order("started_at", { ascending: false });

      if (data) {
        setConversations(data as AgentConversation[]);
      }
    };

    fetchInitial();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("agent_conversations_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_conversations",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setConversations((prev) => [payload.new as AgentConversation, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === (payload.new as AgentConversation).id
                  ? (payload.new as AgentConversation)
                  : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setConversations((prev) =>
              prev.filter((c) => c.id !== (payload.old as { id: string }).id)
            );
          }
          queryClient.invalidateQueries({ queryKey: ["agent_conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return conversations;
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversation: Partial<AgentConversation>) => {
      const { data, error } = await supabase
        .from("agent_conversations")
        .insert([conversation as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent_conversations"] });
    },
  });
};

export const useConversationStats = () => {
  return useQuery({
    queryKey: ["conversation_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_conversations")
        .select("agent_name, is_active, sentiment, revenue_generated, outcome");

      if (error) throw error;

      const conversations = data as AgentConversation[];

      const byAgent = conversations.reduce((acc, c) => {
        if (!acc[c.agent_name]) {
          acc[c.agent_name] = { active: 0, completed: 0, revenue: 0 };
        }
        if (c.is_active) acc[c.agent_name].active++;
        else acc[c.agent_name].completed++;
        acc[c.agent_name].revenue += Number(c.revenue_generated);
        return acc;
      }, {} as Record<string, { active: number; completed: number; revenue: number }>);

      return {
        totalConversations: conversations.length,
        activeConversations: conversations.filter((c) => c.is_active).length,
        totalRevenueGenerated: conversations.reduce(
          (sum, c) => sum + Number(c.revenue_generated),
          0
        ),
        byAgent,
        sentimentBreakdown: {
          positive: conversations.filter((c) => c.sentiment === "positive").length,
          neutral: conversations.filter((c) => c.sentiment === "neutral").length,
          negative: conversations.filter((c) => c.sentiment === "negative").length,
        },
      };
    },
  });
};
