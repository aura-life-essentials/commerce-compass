-- Create secure lead intake table for public submissions with owner-only visibility
CREATE TABLE IF NOT EXISTS public.lead_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  website TEXT,
  project_type TEXT,
  budget_range TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'new',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  assigned_owner_user_id UUID,
  last_contacted_at TIMESTAMPTZ
);

ALTER TABLE public.lead_contacts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lead_contacts_created_at ON public.lead_contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_status ON public.lead_contacts (status);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_owner ON public.lead_contacts (assigned_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_lead_contacts_email ON public.lead_contacts (email);

DROP POLICY IF EXISTS "Public can submit lead contacts" ON public.lead_contacts;
CREATE POLICY "Public can submit lead contacts"
ON public.lead_contacts
FOR INSERT
TO public
WITH CHECK (
  char_length(trim(full_name)) BETWEEN 1 AND 120
  AND (email IS NULL OR char_length(trim(email)) BETWEEN 3 AND 255)
  AND (phone IS NULL OR char_length(trim(phone)) <= 40)
  AND (company_name IS NULL OR char_length(trim(company_name)) <= 160)
  AND (website IS NULL OR char_length(trim(website)) <= 255)
  AND (project_type IS NULL OR char_length(trim(project_type)) <= 80)
  AND (budget_range IS NULL OR char_length(trim(budget_range)) <= 80)
  AND (message IS NULL OR char_length(trim(message)) <= 4000)
  AND (source IS NULL OR char_length(trim(source)) <= 80)
);

DROP POLICY IF EXISTS "Super admins can view all lead contacts" ON public.lead_contacts;
CREATE POLICY "Super admins can view all lead contacts"
ON public.lead_contacts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can update all lead contacts" ON public.lead_contacts;
CREATE POLICY "Super admins can update all lead contacts"
ON public.lead_contacts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can delete all lead contacts" ON public.lead_contacts;
CREATE POLICY "Super admins can delete all lead contacts"
ON public.lead_contacts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS update_lead_contacts_updated_at ON public.lead_contacts;
CREATE TRIGGER update_lead_contacts_updated_at
BEFORE UPDATE ON public.lead_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();