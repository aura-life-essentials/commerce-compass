
-- 1. Revenue attribution table — single source of truth for "money hit the bank"
CREATE TABLE IF NOT EXISTS public.revenue_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  agent_name TEXT,
  agent_role TEXT,
  campaign_id UUID,
  source_channel TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  product_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_attribution_agent ON public.revenue_attribution(agent_name);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_campaign ON public.revenue_attribution(campaign_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_effective ON public.revenue_attribution(effective_at DESC);

ALTER TABLE public.revenue_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view revenue_attribution"
  ON public.revenue_attribution FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Service role manages revenue_attribution"
  ON public.revenue_attribution FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. Force every campaign to carry a Stripe payment link before activation
ALTER TABLE public.organic_campaigns
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

CREATE OR REPLACE FUNCTION public.enforce_revenue_link_on_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('active','live','launched','published')
     AND (NEW.stripe_payment_link IS NULL OR length(trim(NEW.stripe_payment_link)) = 0) THEN
    RAISE EXCEPTION 'Campaign % cannot go live without a stripe_payment_link (Money-or-it-didn''t-happen rule).', NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_revenue_link ON public.organic_campaigns;
CREATE TRIGGER trg_enforce_revenue_link
  BEFORE INSERT OR UPDATE ON public.organic_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.enforce_revenue_link_on_campaign();

-- 3. Enable Realtime broadcast on revenue feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.revenue_attribution;
