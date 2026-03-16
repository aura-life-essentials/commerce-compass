-- Sell race orchestration for enterprise agent competition
CREATE TABLE public.sales_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID,
  title TEXT NOT NULL,
  command_text TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 1000,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  objective TEXT NOT NULL DEFAULT 'Sell all products as effectively as possible',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winning_agent_id UUID,
  winning_agent_name TEXT,
  winning_revenue NUMERIC NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  connected_store_count INTEGER NOT NULL DEFAULT 0,
  connected_product_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales races"
ON public.sales_races
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view sales races"
ON public.sales_races
FOR SELECT
TO authenticated
USING (true);

CREATE TABLE public.sales_race_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_race_id UUID NOT NULL REFERENCES public.sales_races(id) ON DELETE CASCADE,
  agent_brain_id UUID REFERENCES public.agent_brains(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  agent_role TEXT,
  agent_type TEXT,
  lane_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  target_amount NUMERIC NOT NULL DEFAULT 1000,
  revenue_generated NUMERIC NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  avg_order_value NUMERIC NOT NULL DEFAULT 0,
  outreach_count INTEGER NOT NULL DEFAULT 0,
  campaigns_launched INTEGER NOT NULL DEFAULT 0,
  products_pitched INTEGER NOT NULL DEFAULT 0,
  last_action_at TIMESTAMPTZ,
  fastest_sale_at TIMESTAMPTZ,
  rank_position INTEGER,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sales_race_id, lane_number)
);

CREATE INDEX idx_sales_race_agents_sales_race_id ON public.sales_race_agents(sales_race_id);
CREATE INDEX idx_sales_race_agents_rank_position ON public.sales_race_agents(sales_race_id, rank_position);
ALTER TABLE public.sales_race_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales race agents"
ON public.sales_race_agents
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view sales race agents"
ON public.sales_race_agents
FOR SELECT
TO authenticated
USING (true);

CREATE TABLE public.sales_race_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_race_id UUID NOT NULL REFERENCES public.sales_races(id) ON DELETE CASCADE,
  sales_race_agent_id UUID REFERENCES public.sales_race_agents(id) ON DELETE CASCADE,
  agent_brain_id UUID REFERENCES public.agent_brains(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'info',
  revenue_delta NUMERIC NOT NULL DEFAULT 0,
  order_delta INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_race_events_sales_race_id_created_at ON public.sales_race_events(sales_race_id, created_at DESC);
ALTER TABLE public.sales_race_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales race events"
ON public.sales_race_events
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view sales race events"
ON public.sales_race_events
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.refresh_sales_race_leaderboard(_sales_race_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY revenue_generated DESC, orders_count DESC, COALESCE(fastest_sale_at, created_at) ASC
      ) AS next_rank
    FROM public.sales_race_agents
    WHERE sales_race_id = _sales_race_id
  )
  UPDATE public.sales_race_agents sra
  SET rank_position = ranked.next_rank,
      updated_at = now()
  FROM ranked
  WHERE sra.id = ranked.id;

  UPDATE public.sales_races sr
  SET total_revenue = COALESCE((SELECT SUM(revenue_generated) FROM public.sales_race_agents WHERE sales_race_id = _sales_race_id), 0),
      total_orders = COALESCE((SELECT SUM(orders_count) FROM public.sales_race_agents WHERE sales_race_id = _sales_race_id), 0),
      winning_agent_id = (
        SELECT agent_brain_id FROM public.sales_race_agents
        WHERE sales_race_id = _sales_race_id
        ORDER BY rank_position ASC NULLS LAST, revenue_generated DESC
        LIMIT 1
      ),
      winning_agent_name = (
        SELECT agent_name FROM public.sales_race_agents
        WHERE sales_race_id = _sales_race_id
        ORDER BY rank_position ASC NULLS LAST, revenue_generated DESC
        LIMIT 1
      ),
      winning_revenue = COALESCE((
        SELECT revenue_generated FROM public.sales_race_agents
        WHERE sales_race_id = _sales_race_id
        ORDER BY rank_position ASC NULLS LAST, revenue_generated DESC
        LIMIT 1
      ), 0),
      completed_at = CASE
        WHEN EXISTS (
          SELECT 1 FROM public.sales_race_agents
          WHERE sales_race_id = _sales_race_id AND revenue_generated >= target_amount
        ) THEN now()
        ELSE sr.completed_at
      END,
      status = CASE
        WHEN EXISTS (
          SELECT 1 FROM public.sales_race_agents
          WHERE sales_race_id = _sales_race_id AND revenue_generated >= target_amount
        ) THEN 'completed'
        WHEN sr.started_at IS NOT NULL THEN 'active'
        ELSE sr.status
      END,
      updated_at = now()
  WHERE sr.id = _sales_race_id;

  UPDATE public.sales_race_agents
  SET is_winner = (rank_position = 1)
  WHERE sales_race_id = _sales_race_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_sales_race_agent_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_sales_race_leaderboard(COALESCE(NEW.sales_race_id, OLD.sales_race_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER refresh_sales_race_agent_leaderboard_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.sales_race_agents
FOR EACH ROW
EXECUTE FUNCTION public.handle_sales_race_agent_refresh();

CREATE TRIGGER update_sales_races_updated_at
BEFORE UPDATE ON public.sales_races
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_race_agents_updated_at
BEFORE UPDATE ON public.sales_race_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();