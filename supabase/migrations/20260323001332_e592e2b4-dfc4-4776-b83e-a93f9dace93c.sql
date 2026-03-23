-- Drop the fully open policies
DROP POLICY IF EXISTS "Allow insert agent_teams" ON public.agent_teams;
DROP POLICY IF EXISTS "Allow read agent_teams" ON public.agent_teams;
DROP POLICY IF EXISTS "Allow update agent_teams" ON public.agent_teams;

-- Admins can fully manage
CREATE POLICY "Admins manage agent_teams"
  ON public.agent_teams FOR ALL TO public
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Service role for backend/edge function writes
CREATE POLICY "Service role manages agent_teams"
  ON public.agent_teams FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated users can view
CREATE POLICY "Authenticated users view agent_teams"
  ON public.agent_teams FOR SELECT TO authenticated
  USING (true);