import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  category: string | null;
  images: string[];
  inventory_quantity: number | null;
  status: string | null;
  store_id: string;
  created_at: string;
  tags: string[] | null;
}

// Helper to safely parse JSON images array
const parseImages = (images: Json | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.filter((img): img is string => typeof img === 'string');
  }
  return [];
};

export const useProducts = (storeId?: string) => {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        images: parseImages(item.images),
      })) as Product[];
    },
  });
};

export const useTopProducts = (limit = 10) => {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        images: parseImages(item.images),
      })) as Product[];
    },
  });
};
