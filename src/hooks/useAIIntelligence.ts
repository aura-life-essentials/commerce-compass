import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type IntelligenceType = 'research' | 'competitor' | 'trend' | 'financial';
type IntelligenceMode = 'local' | 'external';

interface IntelligenceResult {
  content: string;
  citations: string[];
  model: string;
}

export function useAIIntelligence() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntelligenceResult | null>(null);

  const query = useCallback(async (
    queryText: string,
    type: IntelligenceType = 'research',
    mode: IntelligenceMode = 'local'
  ): Promise<IntelligenceResult | null> => {
    if (!queryText.trim()) return null;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke('ai-intelligence', {
        body: { query: queryText, type, mode },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      const data: IntelligenceResult = response.data;
      setResult(data);
      return data;
    } catch (error) {
      console.error('AI Intelligence Error:', error);
      toast.error(mode === 'local' ? 'Local intelligence failed' : 'External intelligence failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    query,
    isLoading,
    result,
  };
}
