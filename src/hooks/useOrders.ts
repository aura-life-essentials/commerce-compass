import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  user_id: string | null;
  store_id: string | null;
  stripe_payment_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, any> | null;
  billing_address: Record<string, any> | null;
  items: Array<{
    product_id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  fulfillment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useAllOrders = (limit = 100) => {
  return useQuery({
    queryKey: ["all_orders", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      fulfillment_status,
      tracking_number,
      tracking_url,
    }: {
      orderId: string;
      status?: string;
      fulfillment_status?: string;
      tracking_number?: string;
      tracking_url?: string;
    }) => {
      const updates: Partial<Order> = {};
      if (status) updates.status = status;
      if (fulfillment_status) updates.fulfillment_status = fulfillment_status;
      if (tracking_number) updates.tracking_number = tracking_number;
      if (tracking_url) updates.tracking_url = tracking_url;

      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["all_orders"] });
    },
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: ["order_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status, fulfillment_status, total_amount, created_at");

      if (error) throw error;

      const orders = data as Order[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        todayOrders: orders.filter(
          (o) => new Date(o.created_at) >= today
        ).length,
        todayRevenue: orders
          .filter((o) => new Date(o.created_at) >= today)
          .reduce((sum, o) => sum + Number(o.total_amount), 0),
      };
    },
  });
};
