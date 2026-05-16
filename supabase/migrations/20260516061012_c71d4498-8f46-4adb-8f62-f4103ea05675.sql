
-- Grok CEO audit log (write-once, owner-eyes-only)
CREATE TABLE IF NOT EXISTS public.grok_ceo_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  input_mode text NOT NULL DEFAULT 'text', -- text | voice
  command text NOT NULL,
  parsed_intent jsonb,
  grok_response jsonb,
  routing_decision jsonb,
  status text NOT NULL DEFAULT 'ok',
  error text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.grok_ceo_audit ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT
CREATE POLICY "grok_ceo_audit_super_admin_select"
  ON public.grok_ceo_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- service_role full access (edge functions write here)
CREATE POLICY "grok_ceo_audit_service_all"
  ON public.grok_ceo_audit FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Block UPDATE/DELETE for everyone except service_role (no policy = denied with RLS on)
-- Index for fast recent-first lookup
CREATE INDEX IF NOT EXISTS idx_grok_ceo_audit_created ON public.grok_ceo_audit (created_at DESC);

-- Multi-store routing suggestions
CREATE TABLE IF NOT EXISTS public.multi_store_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_signal text NOT NULL, -- e.g. "tiktok_viral", "google_trend", "abandoned_cart"
  product_id text,
  product_title text,
  recommended_store_id uuid,
  recommended_store_name text,
  reasoning text,
  expected_revenue_lift numeric DEFAULT 0,
  confidence numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | applied
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multi_store_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "msr_super_admin_select"
  ON public.multi_store_routing FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "msr_super_admin_update"
  ON public.multi_store_routing FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "msr_service_all"
  ON public.multi_store_routing FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_msr_updated
  BEFORE UPDATE ON public.multi_store_routing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Owner-gated RPC bridge: whitelisted actions only, never raw SQL
CREATE OR REPLACE FUNCTION public.exec_owner_command(_action text, _params jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _result jsonb;
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;
  -- Must be super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'forbidden: super_admin only';
  END IF;
  -- Must match owner email allowlist
  SELECT lower(email) INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email NOT IN ('ryanauralift@gmail.com','thegrokfather@outlook.com') THEN
    RAISE EXCEPTION 'forbidden: owner email allowlist';
  END IF;

  -- Whitelisted actions
  CASE _action
    WHEN 'ping' THEN
      _result := jsonb_build_object('ok', true, 'now', now(), 'email', _email);
    WHEN 'refresh_sales_race' THEN
      PERFORM public.refresh_sales_race_leaderboard((_params->>'sales_race_id')::uuid);
      _result := jsonb_build_object('ok', true, 'action', 'refresh_sales_race');
    WHEN 'audit_recent' THEN
      SELECT jsonb_agg(row_to_json(a) ORDER BY a.created_at DESC)
        INTO _result
        FROM (SELECT * FROM public.grok_ceo_audit ORDER BY created_at DESC LIMIT COALESCE((_params->>'limit')::int, 50)) a;
      _result := jsonb_build_object('ok', true, 'audit', COALESCE(_result, '[]'::jsonb));
    WHEN 'routing_pending' THEN
      SELECT jsonb_agg(row_to_json(r) ORDER BY r.created_at DESC)
        INTO _result
        FROM (SELECT * FROM public.multi_store_routing WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100) r;
      _result := jsonb_build_object('ok', true, 'routing', COALESCE(_result, '[]'::jsonb));
    ELSE
      RAISE EXCEPTION 'unknown action: %', _action;
  END CASE;

  RETURN _result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.exec_owner_command(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.exec_owner_command(text, jsonb) TO authenticated, service_role;
