-- Fix agent_teams: drop existing policies and recreate
DROP POLICY IF EXISTS "Admins manage agent_teams" ON public.agent_teams;
DROP POLICY IF EXISTS "Service role manages agent_teams" ON public.agent_teams;
DROP POLICY IF EXISTS "Authenticated users view agent_teams" ON public.agent_teams;
DROP POLICY IF EXISTS "Authenticated users can view agent_teams" ON public.agent_teams;

CREATE POLICY "Admins manage agent_teams"
  ON public.agent_teams FOR ALL TO public
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Service role manages agent_teams"
  ON public.agent_teams FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users view agent_teams"
  ON public.agent_teams FOR SELECT TO authenticated
  USING (true);

-- Harden user_roles
DROP POLICY IF EXISTS "Service role manages user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Service role manages user_roles"
  ON public.user_roles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);