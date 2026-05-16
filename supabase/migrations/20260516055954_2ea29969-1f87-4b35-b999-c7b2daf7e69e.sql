-- 1. Update signup trigger so BOTH owner emails get super_admin automatically
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF lower(NEW.email) IN ('ryanauralift@gmail.com', 'thegrokfather@outlook.com') THEN
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
$$;

-- 2. Promote thegrokfather@outlook.com NOW if the account already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE lower(email) = 'thegrokfather@outlook.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Remove every non-owner login (cascades to user_roles, profiles, etc.)
DELETE FROM auth.users
WHERE lower(email) NOT IN ('ryanauralift@gmail.com', 'thegrokfather@outlook.com');