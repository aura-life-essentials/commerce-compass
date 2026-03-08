
-- Agent Teams table
CREATE TABLE public.agent_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_number integer NOT NULL,
  team_name text NOT NULL,
  team_type text NOT NULL DEFAULT 'sales',
  niche text NOT NULL DEFAULT 'general',
  is_active boolean DEFAULT true,
  total_revenue numeric DEFAULT 0,
  deals_closed integer DEFAULT 0,
  campaigns_run integer DEFAULT 0,
  performance_score numeric DEFAULT 0,
  current_workflow text DEFAULT 'idle',
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read agent_teams" ON public.agent_teams FOR SELECT USING (true);
CREATE POLICY "Allow insert agent_teams" ON public.agent_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update agent_teams" ON public.agent_teams FOR UPDATE USING (true);

-- Add team_id to agent_brains
ALTER TABLE public.agent_brains ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.agent_teams(id);
ALTER TABLE public.agent_brains ADD COLUMN IF NOT EXISTS agent_role text DEFAULT 'generalist';
ALTER TABLE public.agent_brains ADD COLUMN IF NOT EXISTS brain_template text DEFAULT 'standard';
ALTER TABLE public.agent_brains ADD COLUMN IF NOT EXISTS tasks_completed integer DEFAULT 0;
ALTER TABLE public.agent_brains ADD COLUMN IF NOT EXISTS revenue_generated numeric DEFAULT 0;

-- Enable realtime for teams
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_teams;

-- Seed 40 teams
INSERT INTO public.agent_teams (team_number, team_name, team_type, niche) VALUES
(1,'Alpha Strike','sales','beauty'),(2,'Blitz Force','sales','beauty'),(3,'Phantom Ops','sales','beauty'),(4,'Iron Pulse','sales','beauty'),(5,'Shadow Net','sales','beauty'),
(6,'Vortex One','sales','health'),(7,'Storm Cell','sales','health'),(8,'Apex Unit','sales','health'),(9,'Dark Matter','sales','health'),(10,'Rapid Fire','sales','health'),
(11,'Zero Hour','sales','home'),(12,'Ghost Grid','sales','home'),(13,'Titan Squad','sales','home'),(14,'Eclipse','sales','home'),(15,'Omega Prime','sales','home'),
(16,'Nova Burst','sales','tech'),(17,'Cyber Edge','sales','tech'),(18,'Quantum Leap','sales','tech'),(19,'Hyper Core','sales','tech'),(20,'Neon Wave','sales','tech'),
(21,'Steel Forge','sales','office'),(22,'Pulse Drive','sales','office'),(23,'Arc Light','sales','office'),(24,'Flare Unit','sales','office'),(25,'Bolt Strike','sales','office'),
(26,'Magma Cell','sales','cutting_edge'),(27,'Frost Byte','sales','cutting_edge'),(28,'Prism Force','sales','cutting_edge'),(29,'Razor Net','sales','cutting_edge'),(30,'Surge Team','sales','cutting_edge'),
(31,'Comet Trail','outreach','beauty'),(32,'Nebula Ops','outreach','health'),(33,'Solar Wind','outreach','home'),(34,'Lunar Tide','outreach','tech'),(35,'Star Gate','outreach','office'),
(36,'Plasma Arc','content','beauty'),(37,'Photon Rush','content','health'),(38,'Sonic Boom','content','home'),(39,'Thunder Cell','content','tech'),(40,'Blaze Core','content','cutting_edge');

-- Seed 200 agents (5 per team) with roles: Lead, Content, Marketer, Closer, Analyst
DO $$
DECLARE
  t RECORD;
  roles text[] := ARRAY['team_lead','content_creator','marketer','closer','analyst'];
  brain_templates text[] := ARRAY['strategic','creative','aggressive','persuasive','analytical'];
  agent_types text[] := ARRAY['omega_swarm','content_creator','traffic_generator','profit_reaper','viral_hunter'];
  r integer;
BEGIN
  FOR t IN SELECT id, team_number, team_name, niche FROM public.agent_teams ORDER BY team_number LOOP
    FOR r IN 1..5 LOOP
      INSERT INTO public.agent_brains (
        agent_name, agent_type, team_id, agent_role, brain_template, is_active, current_state, performance_score
      ) VALUES (
        t.team_name || ' - ' || initcap(replace(roles[r], '_', ' ')),
        agent_types[r],
        t.id,
        roles[r],
        brain_templates[r],
        true,
        jsonb_build_object('team', t.team_name, 'niche', t.niche, 'role', roles[r], 'ready', true),
        round((random() * 40 + 60)::numeric, 1)
      );
    END LOOP;
  END LOOP;
END $$;
