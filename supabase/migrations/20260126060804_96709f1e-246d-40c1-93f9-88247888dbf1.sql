-- Create autonomous agent brain table for self-thinking decisions
CREATE TABLE IF NOT EXISTS public.agent_brains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('profit_reaper', 'omega_swarm', 'viral_hunter', 'content_creator', 'traffic_generator', 'global_expander')),
  current_state JSONB DEFAULT '{}',
  decision_history JSONB DEFAULT '[]',
  learning_data JSONB DEFAULT '{}',
  performance_score NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_decision_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create viral content library for scraped winning videos
CREATE TABLE IF NOT EXISTS public.viral_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'facebook', 'twitter', 'unknown')),
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'carousel', 'story')),
  engagement_score NUMERIC DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  extracted_hooks JSONB DEFAULT '[]',
  hashtags TEXT[] DEFAULT '{}',
  audio_trends JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketing campaigns for AI-generated content
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('tiktok', 'instagram', 'youtube', 'facebook', 'google_ads', 'email', 'sms')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  ai_generated_content JSONB DEFAULT '{}',
  video_script TEXT,
  voiceover_url TEXT,
  thumbnail_url TEXT,
  performance_metrics JSONB DEFAULT '{}',
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  roi_percentage NUMERIC DEFAULT 0,
  target_countries TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create traffic webhooks for organic ad tracking
CREATE TABLE IF NOT EXISTS public.traffic_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL CHECK (webhook_type IN ('click', 'view', 'conversion', 'purchase', 'signup')),
  source TEXT NOT NULL,
  country TEXT,
  device TEXT,
  utm_data JSONB DEFAULT '{}',
  revenue NUMERIC DEFAULT 0,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Stripe payment records
CREATE TABLE IF NOT EXISTS public.stripe_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  product_ids TEXT[] DEFAULT '{}',
  customer_email TEXT,
  customer_country TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create global expansion tracking
CREATE TABLE IF NOT EXISTS public.global_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  region TEXT NOT NULL,
  currency TEXT NOT NULL,
  language TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  market_score NUMERIC DEFAULT 0,
  potential_revenue NUMERIC DEFAULT 0,
  current_revenue NUMERIC DEFAULT 0,
  stores_count INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create AI decision logs for autonomous operations
CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_brain_id UUID REFERENCES public.agent_brains(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  reasoning TEXT,
  output_action JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  executed BOOLEAN DEFAULT false,
  execution_result JSONB,
  revenue_impact NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agent_brains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;

-- Create public policies
CREATE POLICY "Public read agent_brains" ON public.agent_brains FOR SELECT USING (true);
CREATE POLICY "Public insert agent_brains" ON public.agent_brains FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update agent_brains" ON public.agent_brains FOR UPDATE USING (true);

CREATE POLICY "Public read viral_content" ON public.viral_content FOR SELECT USING (true);
CREATE POLICY "Public insert viral_content" ON public.viral_content FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Public insert marketing_campaigns" ON public.marketing_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE USING (true);

CREATE POLICY "Public read traffic_webhooks" ON public.traffic_webhooks FOR SELECT USING (true);
CREATE POLICY "Public insert traffic_webhooks" ON public.traffic_webhooks FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read stripe_transactions" ON public.stripe_transactions FOR SELECT USING (true);
CREATE POLICY "Public insert stripe_transactions" ON public.stripe_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read global_markets" ON public.global_markets FOR SELECT USING (true);
CREATE POLICY "Public insert global_markets" ON public.global_markets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update global_markets" ON public.global_markets FOR UPDATE USING (true);

CREATE POLICY "Public read ai_decisions" ON public.ai_decisions FOR SELECT USING (true);
CREATE POLICY "Public insert ai_decisions" ON public.ai_decisions FOR INSERT WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_brains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stripe_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_webhooks;

-- Seed initial global markets data
INSERT INTO public.global_markets (country_code, country_name, region, currency, language, market_score, potential_revenue) VALUES
('US', 'United States', 'North America', 'USD', 'en', 95, 500000),
('GB', 'United Kingdom', 'Europe', 'GBP', 'en', 85, 200000),
('DE', 'Germany', 'Europe', 'EUR', 'de', 80, 180000),
('FR', 'France', 'Europe', 'EUR', 'fr', 75, 150000),
('CA', 'Canada', 'North America', 'CAD', 'en', 78, 120000),
('AU', 'Australia', 'Oceania', 'AUD', 'en', 72, 100000),
('JP', 'Japan', 'Asia', 'JPY', 'ja', 70, 150000),
('BR', 'Brazil', 'South America', 'BRL', 'pt', 65, 80000),
('IN', 'India', 'Asia', 'INR', 'en', 68, 200000),
('MX', 'Mexico', 'North America', 'MXN', 'es', 60, 60000)
ON CONFLICT (country_code) DO NOTHING;

-- Seed initial agent brains
INSERT INTO public.agent_brains (agent_name, agent_type, current_state, is_active) VALUES
('Profit Reaper Alpha', 'profit_reaper', '{"mode": "aggressive", "target_margin": 0.67, "auto_reprice": true}', true),
('Omega Swarm Commander', 'omega_swarm', '{"swarm_size": 100, "scaling_mode": "auto", "regions": ["US", "EU", "APAC"]}', true),
('Viral Hunter Prime', 'viral_hunter', '{"platforms": ["tiktok", "instagram"], "min_engagement": 10000}', true),
('Content Creator X', 'content_creator', '{"style": "dynamic", "voice_id": "JBFqnCBsd6RMkjVDRZzb", "languages": ["en", "es", "fr"]}', true),
('Traffic Generator Omega', 'traffic_generator', '{"daily_target": 10000, "conversion_goal": 0.03}', true),
('Global Expander Zeus', 'global_expander', '{"expansion_speed": "aggressive", "priority_markets": ["EU", "APAC"]}', true);