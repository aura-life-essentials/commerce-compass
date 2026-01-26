import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CEODecision {
  id: string;
  decision_type: string;
  reasoning: string;
  confidence_score: number;
  executed: boolean;
  created_at: string;
  output_action: {
    action?: string;
    category?: string;
    priority?: string;
    expected_impact?: string;
  };
}

export interface CEOMetrics {
  revenue: number;
  orders: number;
  products: number;
  activeAgents: number;
  conversionRate: number;
  avgOrderValue: number;
}

export const useCeoBrain = () => {
  const queryClient = useQueryClient();
  const [isThinking, setIsThinking] = useState(false);

  // Fetch recent AI decisions
  const { data: decisions, isLoading: decisionsLoading } = useQuery({
    queryKey: ['ai-decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as CEODecision[];
    },
    refetchInterval: 10000,
  });

  // Fetch agent brains
  const { data: agentBrains } = useQuery({
    queryKey: ['agent-brains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_brains')
        .select('*')
        .order('performance_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch live metrics
  const { data: metrics } = useQuery({
    queryKey: ['ceo-metrics'],
    queryFn: async () => {
      const [revenueRes, productsRes] = await Promise.all([
        supabase.from('revenue_metrics').select('revenue, orders_count, conversion_rate, avg_order_value'),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);
      
      const totalRevenue = revenueRes.data?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
      const totalOrders = revenueRes.data?.reduce((sum, r) => sum + (r.orders_count || 0), 0) || 0;
      const avgConversion = revenueRes.data?.length 
        ? revenueRes.data.reduce((sum, r) => sum + (r.conversion_rate || 0), 0) / revenueRes.data.length 
        : 0;
      const avgAOV = revenueRes.data?.length
        ? revenueRes.data.reduce((sum, r) => sum + (r.avg_order_value || 0), 0) / revenueRes.data.length
        : 0;

      return {
        revenue: totalRevenue,
        orders: totalOrders,
        products: productsRes.count || 0,
        activeAgents: 6, // Default active agents
        conversionRate: avgConversion * 100,
        avgOrderValue: avgAOV,
      } as CEOMetrics;
    },
    refetchInterval: 5000,
  });

  // Think mutation
  const thinkMutation = useMutation({
    mutationFn: async (focusArea: string) => {
      setIsThinking(true);
      const response = await supabase.functions.invoke('ceo-brain', {
        body: { action: 'think', focusArea },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
      setIsThinking(false);
    },
    onError: () => {
      setIsThinking(false);
    },
  });

  // Execute decision mutation
  const executeMutation = useMutation({
    mutationFn: async (decisionId: string) => {
      const response = await supabase.functions.invoke('ceo-brain', {
        body: { action: 'execute_decision', decisionId },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
    },
  });

  const think = useCallback((focusArea: string) => {
    thinkMutation.mutate(focusArea);
  }, [thinkMutation]);

  return {
    decisions,
    decisionsLoading,
    metrics,
    agentBrains,
    isThinking,
    think,
    executeDecision: executeMutation.mutate,
  };
};

export const useVoiceCommand = (onCommand: (command: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        onCommand(text);
      }
    };

    recognition.start();
  }, [onCommand]);

  return {
    isListening,
    transcript,
    startListening,
  };
};
