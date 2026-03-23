
DROP TRIGGER IF EXISTS refresh_sales_race_agent_leaderboard_after_change ON public.sales_race_agents;

CREATE OR REPLACE FUNCTION public.handle_sales_race_agent_refresh()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Only refresh if revenue or orders actually changed
  IF TG_OP = 'UPDATE' AND (OLD.revenue_generated IS DISTINCT FROM NEW.revenue_generated OR OLD.orders_count IS DISTINCT FROM NEW.orders_count) THEN
    PERFORM public.refresh_sales_race_leaderboard(NEW.sales_race_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER refresh_sales_race_leaderboard_on_revenue
  AFTER UPDATE ON public.sales_race_agents
  FOR EACH ROW
  WHEN (OLD.revenue_generated IS DISTINCT FROM NEW.revenue_generated OR OLD.orders_count IS DISTINCT FROM NEW.orders_count)
  EXECUTE FUNCTION public.handle_sales_race_agent_refresh()
