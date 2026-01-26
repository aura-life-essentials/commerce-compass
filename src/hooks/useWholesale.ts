import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessContact {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  region: string | null;
  address: Record<string, any> | null;
  source: string;
  lead_score: number;
  status: string;
  tags: string[] | null;
  notes: string | null;
  last_contacted_at: string | null;
  assigned_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface WholesaleDeal {
  id: string;
  business_contact_id: string | null;
  deal_name: string;
  deal_value: number;
  currency: string;
  products: Array<{
    product_id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  quantity_total: number;
  margin_percentage: number | null;
  status: string;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  assigned_agent: string | null;
  negotiation_history: Array<{
    timestamp: string;
    action: string;
    details: string;
    agent: string;
  }>;
  terms: Record<string, any> | null;
  contract_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBusinessContacts = (status?: string) => {
  return useQuery({
    queryKey: ["business_contacts", status],
    queryFn: async () => {
      let query = supabase
        .from("business_contacts")
        .select("*")
        .order("lead_score", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BusinessContact[];
    },
  });
};

export const useWholesaleDeals = (status?: string) => {
  return useQuery({
    queryKey: ["wholesale_deals", status],
    queryFn: async () => {
      let query = supabase
        .from("wholesale_deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WholesaleDeal[];
    },
  });
};

export const useCreateBusinessContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Partial<BusinessContact>) => {
      const { data, error } = await supabase
        .from("business_contacts")
        .insert([contact as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business_contacts"] });
    },
  });
};

export const useCreateWholesaleDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: Partial<WholesaleDeal>) => {
      const { data, error } = await supabase
        .from("wholesale_deals")
        .insert([deal as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wholesale_deals"] });
    },
  });
};

export const useUpdateWholesaleDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WholesaleDeal>;
    }) => {
      const { data, error } = await supabase
        .from("wholesale_deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wholesale_deals"] });
    },
  });
};

export const useWholesaleStats = () => {
  return useQuery({
    queryKey: ["wholesale_stats"],
    queryFn: async () => {
      const [contactsRes, dealsRes] = await Promise.all([
        supabase.from("business_contacts").select("status, lead_score"),
        supabase.from("wholesale_deals").select("status, deal_value, probability"),
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (dealsRes.error) throw dealsRes.error;

      const contacts = contactsRes.data;
      const deals = dealsRes.data as WholesaleDeal[];

      const pipelineValue = deals
        .filter((d) => d.status !== "closed_lost")
        .reduce((sum, d) => sum + Number(d.deal_value) * (d.probability / 100), 0);

      const closedWonValue = deals
        .filter((d) => d.status === "closed_won")
        .reduce((sum, d) => sum + Number(d.deal_value), 0);

      return {
        totalContacts: contacts.length,
        activeLeads: contacts.filter((c) => c.status === "lead").length,
        qualifiedLeads: contacts.filter((c) => c.status === "qualified").length,
        totalDeals: deals.length,
        pipelineValue,
        closedWonValue,
        avgDealSize: deals.length > 0 
          ? deals.reduce((sum, d) => sum + Number(d.deal_value), 0) / deals.length 
          : 0,
      };
    },
  });
};
