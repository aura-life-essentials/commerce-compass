-- ============================================================
-- HARDENING MIGRATION: Close all 17 linter warnings
-- 1. Lock SECURITY DEFINER functions to least-privilege EXECUTE
-- 2. Scope every "Service role only" policy to TO service_role
--    (eliminates "RLS policy always true" warnings)
-- ============================================================

-- ---------- 1. SECURITY DEFINER function ACLs ----------
-- Functions used inside RLS policies must be callable by `authenticated`
-- but never by `anon` or `public`. Internal helpers stay service_role-only.

-- RLS helpers (authenticated callers need EXECUTE for policies to evaluate)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_app_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_app_access(uuid, text) TO authenticated, service_role;

-- Internal-only: triggers + maintenance. service_role only.
REVOKE ALL ON FUNCTION public.handle_sales_race_agent_refresh() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_sales_race_agent_refresh() TO service_role;

REVOKE ALL ON FUNCTION public.refresh_sales_race_leaderboard(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_sales_race_leaderboard(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.enforce_revenue_link_on_campaign() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_revenue_link_on_campaign() TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_profile() TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_role() TO service_role;

-- ---------- 2. Tighten service-role-only RLS policies ----------
-- Pattern: drop the broad policy, recreate with TO service_role so anon/authenticated
-- can never satisfy it even if grants leak.

DO $$
DECLARE
  r record;
  policies_to_lock text[][] := ARRAY[
    ['user_roles','Service role only manage user_roles','ALL'],
    ['profiles','Service role can insert profiles','INSERT'],
    ['stripe_transactions','Service role only insert stripe_transactions','INSERT'],
    ['stores','Service role only insert stores','INSERT'],
    ['stores','Service role only update stores','UPDATE'],
    ['agent_logs','Service role only insert agent_logs','INSERT'],
    ['agent_brains','Service role only insert agent_brains','INSERT'],
    ['agent_brains','Service role only update agent_brains','UPDATE'],
    ['ai_decisions','Service role only insert ai_decisions','INSERT'],
    ['revenue_metrics','Service role only insert revenue_metrics','INSERT'],
    ['revenue_metrics','Service role only update revenue_metrics','UPDATE'],
    ['marketing_campaigns','Service role only insert marketing_campaigns','INSERT'],
    ['marketing_campaigns','Service role only update marketing_campaigns','UPDATE'],
    ['governance_events','Service role only insert governance_events','INSERT'],
    ['governance_events','Service role only update governance_events','UPDATE'],
    ['sync_jobs','Service role only insert sync_jobs','INSERT'],
    ['sync_jobs','Service role only update sync_jobs','UPDATE'],
    ['traffic_webhooks','Service role only insert traffic_webhooks','INSERT'],
    ['viral_content','Service role only insert viral_content','INSERT'],
    ['global_markets','Service role only insert global_markets','INSERT'],
    ['global_markets','Service role only update global_markets','UPDATE'],
    ['notifications','Service role only insert notifications','INSERT'],
    ['notifications','Service role only update notifications','UPDATE'],
    ['products','Service role only insert products','INSERT'],
    ['products','Service role only update products','UPDATE'],
    ['content_pipeline','Service role manages content_pipeline','ALL'],
    ['integrations','Service role manages integrations','ALL'],
    ['webhook_events','Service role manages webhook_events','ALL'],
    ['fulfillment_jobs','Service role manages fulfillment_jobs','ALL'],
    ['agent_runs','Service role manages agent_runs','ALL'],
    ['health_checks','Service role manages health_checks','ALL'],
    ['audit_events','Service role manages audit_events','ALL'],
    ['agent_teams','Service role manages agent_teams','ALL'],
    ['user_roles','Service role manages user_roles','ALL'],
    ['crypto_transactions','Service role manages crypto transactions','ALL'],
    ['stripe_events','Service role manages stripe_events','ALL']
  ];
  i int;
  tbl text;
  pol text;
  op text;
BEGIN
  FOR i IN 1 .. array_length(policies_to_lock, 1) LOOP
    tbl := policies_to_lock[i][1];
    pol := policies_to_lock[i][2];
    op  := policies_to_lock[i][3];

    -- Skip if table or policy doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=tbl AND policyname=pol) THEN
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY %I ON public.%I', pol, tbl);

    IF op = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO service_role WITH CHECK (true)', pol, tbl);
    ELSIF op = 'UPDATE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO service_role USING (true) WITH CHECK (true)', pol, tbl);
    ELSIF op = 'DELETE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO service_role USING (true)', pol, tbl);
    ELSE
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', pol, tbl);
    END IF;
  END LOOP;
END $$;