-- Create stores table to persist Shopify store configurations
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  shopify_store_id TEXT,
  currency TEXT DEFAULT 'USD',
  locale TEXT DEFAULT 'en-US',
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'syncing', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table to sync Shopify product data
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shopify_product_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  category TEXT,
  tags TEXT[],
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_logs table to track AI agent activities
CREATE TABLE public.agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  agent_role TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('started', 'processing', 'completed', 'failed')),
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue_metrics table for aggregated revenue data
CREATE TABLE public.revenue_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(12, 2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 4),
  avg_order_value DECIMAL(10, 2),
  organic_traffic INTEGER DEFAULT 0,
  paid_traffic INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Create sync_jobs table to track sync operations
CREATE TABLE public.sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('products', 'orders', 'inventory', 'full')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_items INTEGER,
  processed_items INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create governance_events table for audit trail
CREATE TABLE public.governance_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('compliance', 'security', 'privacy', 'ethics')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (CEO dashboard is internal tool)
CREATE POLICY "Allow public read access to stores"
  ON public.stores FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to stores"
  ON public.stores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to stores"
  ON public.stores FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to products"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to products"
  ON public.products FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to agent_logs"
  ON public.agent_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to agent_logs"
  ON public.agent_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to revenue_metrics"
  ON public.revenue_metrics FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to revenue_metrics"
  ON public.revenue_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to revenue_metrics"
  ON public.revenue_metrics FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to sync_jobs"
  ON public.sync_jobs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sync_jobs"
  ON public.sync_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sync_jobs"
  ON public.sync_jobs FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to governance_events"
  ON public.governance_events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to governance_events"
  ON public.governance_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to governance_events"
  ON public.governance_events FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_agent_logs_store_id ON public.agent_logs(store_id);
CREATE INDEX idx_agent_logs_created_at ON public.agent_logs(created_at DESC);
CREATE INDEX idx_revenue_metrics_store_date ON public.revenue_metrics(store_id, date DESC);
CREATE INDEX idx_sync_jobs_store_id ON public.sync_jobs(store_id);
CREATE INDEX idx_governance_events_created_at ON public.governance_events(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();