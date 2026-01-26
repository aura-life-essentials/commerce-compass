import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type IntelligenceType = 'research' | 'competitor' | 'trend' | 'financial';

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
    type: IntelligenceType = 'research'
  ): Promise<IntelligenceResult | null> => {
    if (!queryText.trim()) return null;
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-intelligence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: queryText, type }),
        }
      );

      if (!response.ok) {
        throw new Error(`Intelligence query failed: ${response.status}`);
      }

      const data: IntelligenceResult = await response.json();
      setResult(data);
      return data;
    } catch (error) {
      console.error('AI Intelligence Error:', error);
      toast.error('Intelligence query failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    query,
    isLoading,
    result
  };
}
