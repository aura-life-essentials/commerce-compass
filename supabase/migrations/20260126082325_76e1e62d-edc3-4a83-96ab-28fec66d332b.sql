-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'pro', 'enterprise', 'elite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create NFT subscription passes table
CREATE TABLE public.nft_subscription_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  owner_user_id UUID,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'pro', 'enterprise', 'elite')),
  token_id TEXT NOT NULL UNIQUE,
  contract_address TEXT NOT NULL,
  metadata_uri TEXT,
  image_url TEXT,
  is_listed BOOLEAN DEFAULT false,
  list_price_eth NUMERIC,
  marketplace TEXT,
  opensea_url TEXT,
  coinbase_url TEXT,
  rarible_url TEXT,
  minted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service requests table for customer AI bot interactions
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  wallet_address TEXT,
  subscription_id UUID REFERENCES public.subscriptions(id),
  request_type TEXT NOT NULL,
  request_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  assigned_agent TEXT,
  ai_response JSONB,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create industry roadmaps table
CREATE TABLE public.industry_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  company_name TEXT,
  client_user_id UUID,
  subscription_id UUID REFERENCES public.subscriptions(id),
  current_stage TEXT DEFAULT 'assessment',
  web3_readiness_score INTEGER DEFAULT 0,
  projected_revenue_increase NUMERIC,
  roadmap_data JSONB,
  milestones JSONB,
  assigned_agents TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_subscription_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_roadmaps ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies - users can view their own, super_admin can view all
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- NFT passes policies
CREATE POLICY "Users can view own NFT passes" ON public.nft_subscription_passes
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Public can view listed NFT passes" ON public.nft_subscription_passes
  FOR SELECT USING (is_listed = true);

CREATE POLICY "Super admin can manage all NFT passes" ON public.nft_subscription_passes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Service requests policies
CREATE POLICY "Users can view own service requests" ON public.service_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin can manage all service requests" ON public.service_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Industry roadmaps policies
CREATE POLICY "Users can view own roadmaps" ON public.industry_roadmaps
  FOR SELECT USING (client_user_id = auth.uid());

CREATE POLICY "Super admin can manage all roadmaps" ON public.industry_roadmaps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_industry_roadmaps_updated_at
  BEFORE UPDATE ON public.industry_roadmaps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();