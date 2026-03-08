import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ViralProduct {
  name: string;
  category: string;
  sell_price: number;
  cost_price: number;
  profit_margin: number;
  competition: 'low' | 'medium' | 'high';
  viral_score: number;
  platforms: string[];
  why_viral: string;
  hooks: string[];
  hashtags: string[];
  target_demo: string;
  source_urls: string[];
  video_script_idea: string;
}

export interface VideoGeneration {
  product: ViralProduct;
  script: string;
  status: 'idle' | 'scripting' | 'generating' | 'done' | 'error';
  videoRequestId?: string;
  videoUrl?: string;
  error?: string;
}

export function useViralEngine() {
  const [products, setProducts] = useState<ViralProduct[]>([]);
  const [rawResearch, setRawResearch] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [videoGenerations, setVideoGenerations] = useState<VideoGeneration[]>([]);

  const research = useCallback(async (niches?: string[]) => {
    setIsResearching(true);
    setProducts([]);
    setRawResearch('');
    
    try {
      const response = await supabase.functions.invoke('viral-product-research', {
        body: { action: 'research', niches },
      });

      if (response.error) throw response.error;
      
      const data = response.data;
      if (!data.success) throw new Error(data.error || 'Research failed');

      setProducts(data.products || []);
      setRawResearch(data.raw_research || '');
      setCitations(data.citations || []);
      toast.success(`Found ${data.products?.length || 0} viral products!`);
      return data.products;
    } catch (error) {
      console.error('Research error:', error);
      toast.error('Research failed — check your connection');
      return [];
    } finally {
      setIsResearching(false);
    }
  }, []);

  const generateScript = useCallback(async (product: ViralProduct) => {
    const genIndex = videoGenerations.findIndex(g => g.product.name === product.name);
    const newGen: VideoGeneration = { product, script: '', status: 'scripting' };
    
    if (genIndex >= 0) {
      setVideoGenerations(prev => prev.map((g, i) => i === genIndex ? newGen : g));
    } else {
      setVideoGenerations(prev => [...prev, newGen]);
    }

    try {
      const response = await supabase.functions.invoke('viral-product-research', {
        body: { action: 'generate_script', product },
      });

      if (response.error) throw response.error;
      const { script } = response.data;

      setVideoGenerations(prev =>
        prev.map(g => g.product.name === product.name ? { ...g, script, status: 'done' } : g)
      );
      toast.success(`Script ready for ${product.name}`);
      return script;
    } catch (error) {
      setVideoGenerations(prev =>
        prev.map(g => g.product.name === product.name ? { ...g, status: 'error', error: String(error) } : g)
      );
      toast.error(`Script generation failed for ${product.name}`);
      return null;
    }
  }, [videoGenerations]);

  const generateVideo = useCallback(async (product: ViralProduct, script: string) => {
    setVideoGenerations(prev =>
      prev.map(g => g.product.name === product.name ? { ...g, status: 'generating' } : g)
    );

    try {
      const prompt = `Create a viral TikTok-style product video for "${product.name}". 
Style: fast-paced, trendy, eye-catching. 
Scene: Product showcase with dynamic camera movement, aesthetic lighting. 
${script.substring(0, 200)}`;

      const response = await supabase.functions.invoke('xai-video-generate', {
        body: { action: 'generate', prompt, duration: 10, aspect_ratio: '9:16', resolution: '720p' },
      });

      if (response.error) throw response.error;
      const { request_id } = response.data;

      setVideoGenerations(prev =>
        prev.map(g => g.product.name === product.name ? { ...g, videoRequestId: request_id } : g)
      );
      toast.success(`Video generation started for ${product.name}`);
      return request_id;
    } catch (error) {
      setVideoGenerations(prev =>
        prev.map(g => g.product.name === product.name ? { ...g, status: 'error', error: String(error) } : g)
      );
      toast.error(`Video generation failed for ${product.name}`);
      return null;
    }
  }, []);

  const pollVideo = useCallback(async (requestId: string) => {
    try {
      const response = await supabase.functions.invoke('xai-video-generate', {
        body: { action: 'poll', request_id: requestId },
      });
      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Poll error:', error);
      return null;
    }
  }, []);

  return {
    products,
    rawResearch,
    citations,
    isResearching,
    research,
    generateScript,
    generateVideo,
    pollVideo,
    videoGenerations,
  };
}
