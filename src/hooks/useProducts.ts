import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  images: string[];
  inventory_quantity: number;
  status: string;
  store_id: string;
  created_at: string;
}

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
      return data as Product[];
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
      return data as Product[];
    },
  });
};
