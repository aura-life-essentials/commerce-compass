import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface PipelineItem {
  id: string;
  product_name: string;
  product_data: any;
  source: string;
  platform: string;
  script: string | null;
  video_request_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  post_id: string | null;
  post_url: string | null;
  status: string;
  stage: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useContentFactory() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: pipeline = [], isLoading, refetch } = useQuery({
    queryKey: ['content-pipeline'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('content-factory', {
        body: { action: 'get_pipeline' },
      });
      if (response.error) throw response.error;
      return (response.data?.items || []) as PipelineItem[];
    },
    refetchInterval: 10000,
  });

  const startSingle = useCallback(async (product: any) => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('content-factory', {
        body: { action: 'start_single', product },
      });
      if (response.error) throw response.error;
      toast.success(`Pipeline started for ${product.name || product.title}`);
      queryClient.invalidateQueries({ queryKey: ['content-pipeline'] });
      return response.data;
    } catch (error) {
      toast.error(`Pipeline failed: ${error}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [queryClient]);

  const startBatch = useCallback(async (products: any[]) => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('content-factory', {
        body: { action: 'start_batch', products },
      });
      if (response.error) throw response.error;
      toast.success(`Batch pipeline started for ${products.length} products`);
      queryClient.invalidateQueries({ queryKey: ['content-pipeline'] });
      return response.data;
    } catch (error) {
      toast.error(`Batch pipeline failed: ${error}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [queryClient]);

  const pollVideo = useCallback(async (pipelineId: string) => {
    try {
      const response = await supabase.functions.invoke('content-factory', {
        body: { action: 'poll_video', pipeline_id: pipelineId },
      });
      if (response.error) throw response.error;
      if (response.data?.status === 'completed') {
        toast.success('Video ready!');
        queryClient.invalidateQueries({ queryKey: ['content-pipeline'] });
      }
      return response.data;
    } catch (error) {
      console.error('Poll error:', error);
      return null;
    }
  }, [queryClient]);

  return {
    pipeline,
    isLoading,
    isProcessing,
    startSingle,
    startBatch,
    pollVideo,
    refetch,
  };
}
