
-- 1. crypto_transactions: remove public read, restrict to admins
DROP POLICY IF EXISTS "Transactions are public" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Authenticated users can view crypto transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Authenticated can insert transactions" ON public.crypto_transactions;

CREATE POLICY "Admins can view crypto transactions"
  ON public.crypto_transactions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role manages crypto transactions"
  ON public.crypto_transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. agent_logs: restrict reads to admins only (was open to all authenticated)
DROP POLICY IF EXISTS "Authenticated users can view agent_logs" ON public.agent_logs;

CREATE POLICY "Admins can view agent_logs"
  ON public.agent_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. analytics_events: remove the policy that exposes anon rows publicly
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
-- Existing policies keep: admins see all, authenticated users see their own, anon can insert.

-- 4. Purge any existing analytics rows that contain auth tokens in page_url
DELETE FROM public.analytics_events
WHERE page_url ~* '(__lovable_token|access_token=|[?&]token=|session=)';
