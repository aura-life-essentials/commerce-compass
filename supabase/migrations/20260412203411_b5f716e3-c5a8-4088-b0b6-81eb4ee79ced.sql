
-- Remove sensitive tables from Realtime publication safely
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.stripe_transactions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_conversations;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.wholesale_deals;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.crypto_transactions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.project_contributions;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Fix crypto_transactions: remove public SELECT, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view crypto transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Public can view crypto transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Authenticated users can view crypto transactions" ON public.crypto_transactions;

CREATE POLICY "Authenticated users can view crypto transactions"
  ON public.crypto_transactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix analytics_events: remove the public null-user policy, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view anonymous analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Public can view anonymous events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can view their own analytics" ON public.analytics_events;

CREATE POLICY "Authenticated users can view their own analytics"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
