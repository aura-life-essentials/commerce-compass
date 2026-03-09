import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlatformInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  fees: string;
  chain: string;
  best_for: string;
  listing_format: string;
  requirements: string[];
  strategy: string;
}

interface LaunchResult {
  success: boolean;
  listings?: any[];
  pitch?: any;
  platforms?: PlatformInfo[];
  research_summary?: Record<string, string>;
  next_steps?: string[];
  [key: string]: any;
}

export function useWeb3Launch() {
  const [isLoading, setIsLoading] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null);

  const execute = useCallback(async (
    command: 'research' | 'generate_listing' | 'generate_pitch' | 'launch_all' | 'status',
    options?: { platform?: string; project_name?: string; description?: string; project_type?: string }
  ): Promise<LaunchResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('web3-launch-engine', {
        body: { command, ...options },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (command === 'research' && data.platforms) {
        setPlatforms(data.platforms);
      }

      setLaunchResult(data);
      toast.success(`Web3 Launch Engine: ${command} completed`);
      return data;
    } catch (err: any) {
      console.error('Web3 Launch Error:', err);
      toast.error(`Launch engine failed: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, platforms, launchResult };
}
