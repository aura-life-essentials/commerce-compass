-- Create orders table for tracking all customer purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_title TEXT NOT NULL,
  product_price NUMERIC(12,2),
  product_image TEXT,
  notify_on_sale BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint for wishlist items
CREATE UNIQUE INDEX wishlists_user_product_idx ON public.wishlists(user_id, product_id);

-- Create business_contacts for B2B/wholesale CRM
CREATE TABLE public.business_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  country TEXT,
  region TEXT,
  address JSONB,
  source TEXT DEFAULT 'organic',
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'lead',
  tags TEXT[],
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  assigned_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wholesale_deals table for B2B transactions
CREATE TABLE public.wholesale_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_contact_id UUID REFERENCES public.business_contacts(id) ON DELETE SET NULL,
  deal_name TEXT NOT NULL,
  deal_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  products JSONB DEFAULT '[]',
  quantity_total INTEGER DEFAULT 0,
  margin_percentage NUMERIC(5,2),
  status TEXT DEFAULT 'prospecting',
  stage TEXT DEFAULT 'initial_contact',
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_agent TEXT,
  negotiation_history JSONB DEFAULT '[]',
  terms JSONB,
  contract_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agent_conversations for tracking bot interactions
CREATE TABLE public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  conversation_type TEXT DEFAULT 'outreach',
  contact_type TEXT DEFAULT 'business',
  contact_id UUID,
  contact_email TEXT,
  contact_name TEXT,
  platform TEXT DEFAULT 'email',
  channel TEXT,
  subject TEXT,
  messages JSONB DEFAULT '[]',
  sentiment TEXT DEFAULT 'neutral',
  intent TEXT,
  outcome TEXT,
  deal_id UUID REFERENCES public.wholesale_deals(id) ON DELETE SET NULL,
  revenue_generated NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create organic_campaigns for global marketing
CREATE TABLE public.organic_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  target_markets TEXT[] DEFAULT '{}',
  target_platforms TEXT[] DEFAULT '{}',
  content_strategy JSONB,
  generated_content JSONB DEFAULT '[]',
  posts_scheduled INTEGER DEFAULT 0,
  posts_published INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  assigned_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customer_segments for CRM segmentation
CREATE TABLE public.customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  customer_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  avg_order_value NUMERIC(12,2) DEFAULT 0,
  automation_rules JSONB DEFAULT '[]',
  is_dynamic BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organic_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;

-- Orders policies - users see their own, admins see all
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (public.is_admin(auth.uid()));

-- Wishlists policies - users manage their own
CREATE POLICY "Users can view their own wishlist"
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist"
ON public.wishlists FOR ALL
USING (auth.uid() = user_id);

-- Business contacts - admin only
CREATE POLICY "Admins can manage business contacts"
ON public.business_contacts FOR ALL
USING (public.is_admin(auth.uid()));

-- Wholesale deals - admin only
CREATE POLICY "Admins can manage wholesale deals"
ON public.wholesale_deals FOR ALL
USING (public.is_admin(auth.uid()));

-- Agent conversations - admin only
CREATE POLICY "Admins can view agent conversations"
ON public.agent_conversations FOR ALL
USING (public.is_admin(auth.uid()));

-- Organic campaigns - admin only
CREATE POLICY "Admins can manage organic campaigns"
ON public.organic_campaigns FOR ALL
USING (public.is_admin(auth.uid()));

-- Customer segments - admin only
CREATE POLICY "Admins can manage customer segments"
ON public.customer_segments FOR ALL
USING (public.is_admin(auth.uid()));

-- Enable realtime for agent monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wholesale_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_contacts_updated_at
  BEFORE UPDATE ON public.business_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wholesale_deals_updated_at
  BEFORE UPDATE ON public.wholesale_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organic_campaigns_updated_at
  BEFORE UPDATE ON public.organic_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at
  BEFORE UPDATE ON public.customer_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();