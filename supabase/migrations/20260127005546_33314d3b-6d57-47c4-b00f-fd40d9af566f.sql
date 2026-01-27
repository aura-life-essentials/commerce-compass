-- Fix profiles table RLS - restrict to owner only (hides sensitive PII)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix email_logs RLS - add NULL protection
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Update handle_new_user_role function to ONLY grant super_admin to ryanauralift@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Auto-grant super_admin ONLY to ryanauralift@gmail.com
  IF NEW.email = 'ryanauralift@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default role for all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update existing roles: remove super_admin from ryanpuddy@profitreaper.com if exists
DELETE FROM public.user_roles 
WHERE role = 'super_admin' 
AND user_id IN (
  SELECT id FROM auth.users WHERE email = 'ryanpuddy@profitreaper.com'
);

-- Ensure ryanpuddy@profitreaper.com has regular user role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users WHERE email = 'ryanpuddy@profitreaper.com'
ON CONFLICT (user_id, role) DO NOTHING;