-- ============ Per-channel launch consents ============
CREATE TABLE public.launch_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel)
);

CREATE INDEX idx_launch_consents_user ON public.launch_consents (user_id);

ALTER TABLE public.launch_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consents"
  ON public.launch_consents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all consents"
  ON public.launch_consents FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER set_launch_consents_updated_at
  BEFORE UPDATE ON public.launch_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AI action audit log ============
CREATE TABLE public.ai_action_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  agent_name text NOT NULL,
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  channel text,
  summary text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_audit_user ON public.ai_action_audit (user_id);
CREATE INDEX idx_ai_audit_created ON public.ai_action_audit (created_at DESC);
CREATE INDEX idx_ai_audit_action ON public.ai_action_audit (action_type);

ALTER TABLE public.ai_action_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit"
  ON public.ai_action_audit FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all audit"
  ON public.ai_action_audit FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============ Influencers ============
CREATE TABLE public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  platform text NOT NULL,
  display_name text,
  email text,
  follower_count integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  niche text,
  region text,
  contact_url text,
  notes text,
  source text DEFAULT 'agent_discovery',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);

CREATE INDEX idx_influencers_platform ON public.influencers (platform);
CREATE INDEX idx_influencers_niche ON public.influencers (niche);

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read influencers"
  ON public.influencers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage influencers"
  ON public.influencers FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_influencers_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Influencer deals ============
CREATE TABLE public.influencer_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  app_id text NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  commission_rate numeric NOT NULL DEFAULT 0.20,
  outreach_message text,
  reply_message text,
  affiliate_code text UNIQUE,
  affiliate_url text,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  revenue_attributed numeric NOT NULL DEFAULT 0,
  commission_owed numeric NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  contacted_at timestamptz,
  agreed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_influencer_deals_user ON public.influencer_deals (user_id);
CREATE INDEX idx_influencer_deals_status ON public.influencer_deals (status);
CREATE INDEX idx_influencer_deals_app ON public.influencer_deals (app_id);

ALTER TABLE public.influencer_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own deals"
  ON public.influencer_deals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all deals"
  ON public.influencer_deals FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_influencer_deals_updated_at
  BEFORE UPDATE ON public.influencer_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Entitlement-based redirect rules ============
CREATE TABLE public.redirect_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  required_app_id text,
  required_role text,
  source_path text NOT NULL,
  destination_path text NOT NULL,
  fallback_path text NOT NULL DEFAULT '/',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_redirect_rules_active ON public.redirect_rules (is_active, priority);
CREATE INDEX idx_redirect_rules_source ON public.redirect_rules (source_path);

ALTER TABLE public.redirect_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active redirect rules"
  ON public.redirect_rules FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage redirect rules"
  ON public.redirect_rules FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_redirect_rules_updated_at
  BEFORE UPDATE ON public.redirect_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();