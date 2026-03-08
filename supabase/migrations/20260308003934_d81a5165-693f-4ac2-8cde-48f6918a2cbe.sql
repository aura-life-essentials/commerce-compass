
-- 1. Fix profiles: drop overly permissive public SELECT, keep owner-only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix wallet_connections: drop public SELECT, keep owner-only
DROP POLICY IF EXISTS "Wallets are publicly viewable" ON public.wallet_connections;
CREATE POLICY "Users can view own wallets" ON public.wallet_connections
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix email_logs: tighten NULL protection
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- 4. Fix is_admin function with explicit search_path
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- 5. Fix has_role function search_path (already set but ensure consistency)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Fix metaverse_visitors: restrict public read to space participants
DROP POLICY IF EXISTS "Visitors are public" ON public.metaverse_visitors;
CREATE POLICY "Users can view visitors in their spaces" ON public.metaverse_visitors
  FOR SELECT TO authenticated
  USING (
    auth.uid() = visitor_user_id
    OR EXISTS (
      SELECT 1 FROM public.metaverse_spaces
      WHERE id = space_id AND owner_user_id = auth.uid()
    )
  );
