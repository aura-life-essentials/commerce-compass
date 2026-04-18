-- 1. Fix project_contributions: restrict public SELECT to owner + admins
DROP POLICY IF EXISTS "Contributions are public" ON public.project_contributions;

CREATE POLICY "Users can view own contributions"
  ON public.project_contributions FOR SELECT TO authenticated
  USING (auth.uid() = contributor_user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Service role manages contributions"
  ON public.project_contributions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. Lock down Realtime: require admin role to subscribe to any channel
-- (The published tables — agent_logs, notifications, agent_brains, ai_decisions, agent_teams —
-- are all admin/service-only data, so admin-gated subscriptions match the underlying RLS.)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can subscribe to realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to realtime"
  ON realtime.messages FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service role manages realtime messages" ON realtime.messages;
CREATE POLICY "Service role manages realtime messages"
  ON realtime.messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);