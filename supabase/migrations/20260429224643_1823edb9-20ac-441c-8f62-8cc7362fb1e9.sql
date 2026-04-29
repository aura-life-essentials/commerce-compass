
-- Stripe webhook idempotency
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view stripe_events" ON public.stripe_events
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Service role manages stripe_events" ON public.stripe_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Launch webhooks (external notifications)
CREATE TABLE IF NOT EXISTS public.launch_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  secret text,
  event_types text[] NOT NULL DEFAULT ARRAY['status_changed']::text[],
  is_active boolean NOT NULL DEFAULT true,
  last_delivered_at timestamptz,
  last_status integer,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT launch_webhooks_url_https CHECK (url ~* '^https://')
);
ALTER TABLE public.launch_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own webhooks" ON public.launch_webhooks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all webhooks" ON public.launch_webhooks
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Launch status history (immutable audit)
CREATE TABLE IF NOT EXISTS public.launch_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.organic_launches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_launch_status_history_launch ON public.launch_status_history(launch_id);
ALTER TABLE public.launch_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own status history" ON public.launch_status_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all status history" ON public.launch_status_history
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Idempotency key on launches
ALTER TABLE public.organic_launches
  ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_organic_launches_idempotency
  ON public.organic_launches(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
