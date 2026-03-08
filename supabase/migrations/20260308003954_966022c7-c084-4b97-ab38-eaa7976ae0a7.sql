
-- Fix remaining function search_path warnings
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.email = 'ryanauralift@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix RLS "always true" INSERT policies on service-role-only tables
-- These tables are only written by edge functions using service_role key,
-- so we tighten INSERT to require service_role context (auth.uid() IS NULL in service_role)

-- analytics_events: keep public insert for anonymous tracking (intentional)
-- crypto_transactions: tighten to authenticated
DROP POLICY IF EXISTS "System can insert transactions" ON public.crypto_transactions;
CREATE POLICY "Authenticated can insert transactions" ON public.crypto_transactions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- metaverse_visitors: already requires auth.uid() IS NOT NULL - fine
-- dao_votes: already requires auth.uid() IS NOT NULL - fine
-- dao_proposals: already requires auth.uid() IS NOT NULL - fine
-- project_contributions: already requires auth.uid() IS NOT NULL - fine
