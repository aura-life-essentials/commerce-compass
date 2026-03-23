
-- Allow authenticated users to view agent_brains
CREATE POLICY "Authenticated users can view agent_brains"
ON public.agent_brains
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to view agent_teams
CREATE POLICY "Authenticated users can view agent_teams"
ON public.agent_teams
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to view agent_logs
CREATE POLICY "Authenticated users can view agent_logs"
ON public.agent_logs
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to view ai_decisions
CREATE POLICY "Authenticated users can view ai_decisions"
ON public.ai_decisions
FOR SELECT
TO authenticated
USING (true);
