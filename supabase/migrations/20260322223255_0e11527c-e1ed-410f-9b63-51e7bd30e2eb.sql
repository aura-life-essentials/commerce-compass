
-- 1. integrations table (track Shopify/Stripe connection state)
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'shopify', 'stripe', 'fulfillment'
  status text NOT NULL DEFAULT 'not_configured', -- 'connected', 'broken', 'not_configured'
  external_account_id text,
  config_summary jsonb DEFAULT '{}'::jsonb,
  last_verified_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. webhook_events table (log every webhook receipt)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL, -- 'stripe', 'shopify'
  topic text NOT NULL, -- 'payment_intent.succeeded', 'orders/create'
  external_event_id text,
  signature_valid boolean DEFAULT false,
  payload jsonb,
  delivery_status text NOT NULL DEFAULT 'received', -- 'received', 'processed', 'failed'
  response_code integer,
  processing_notes text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- 3. fulfillment_jobs table
CREATE TABLE IF NOT EXISTS public.fulfillment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id),
  order_id uuid REFERENCES public.orders(id),
  provider text NOT NULL DEFAULT 'unassigned',
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'dispatched', 'confirmed', 'failed'
  outbound_payload jsonb,
  response_payload jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. agent_runs table (real agent execution log)
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id),
  agent_name text NOT NULL,
  trigger_source text NOT NULL, -- 'webhook', 'cron', 'manual', 'ceo_brain'
  status text NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  input_payload jsonb DEFAULT '{}'::jsonb,
  output_payload jsonb DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- 5. health_checks table
CREATE TABLE IF NOT EXISTS public.health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem text NOT NULL, -- 'shopify', 'stripe', 'database', 'webhooks', 'fulfillment'
  status text NOT NULL, -- 'pass', 'fail', 'unknown'
  details jsonb DEFAULT '{}'::jsonb,
  checked_at timestamptz NOT NULL DEFAULT now()
);

-- 6. audit_events table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Admin-only read for all new tables
CREATE POLICY "Admins can manage integrations" ON public.integrations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages integrations" ON public.integrations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view webhook_events" ON public.webhook_events FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages webhook_events" ON public.webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view fulfillment_jobs" ON public.fulfillment_jobs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages fulfillment_jobs" ON public.fulfillment_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view agent_runs" ON public.agent_runs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages agent_runs" ON public.agent_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view health_checks" ON public.health_checks FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages health_checks" ON public.health_checks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view audit_events" ON public.audit_events FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Service role manages audit_events" ON public.audit_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON public.webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON public.webhook_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON public.agent_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON public.health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fulfillment_jobs_status ON public.fulfillment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(type);

-- Updated_at triggers for integrations
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
