-- ============ App Entitlements ============
CREATE TABLE public.app_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  source text NOT NULL DEFAULT 'stripe',
  stripe_subscription_id text,
  stripe_price_id text,
  stripe_product_id text,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_id, stripe_subscription_id)
);

CREATE INDEX idx_app_entitlements_user ON public.app_entitlements (user_id);
CREATE INDEX idx_app_entitlements_app ON public.app_entitlements (app_id);
CREATE INDEX idx_app_entitlements_status ON public.app_entitlements (status);

ALTER TABLE public.app_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own entitlements"
  ON public.app_entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins see all entitlements"
  ON public.app_entitlements FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER set_app_entitlements_updated_at
  BEFORE UPDATE ON public.app_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Organic Launches ============
CREATE TABLE public.organic_launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  app_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  platforms text[] NOT NULL DEFAULT ARRAY[]::text[],
  posts_generated integer NOT NULL DEFAULT 0,
  landing_pages_generated integer NOT NULL DEFAULT 0,
  stripe_checkout_url text,
  stripe_price_id text,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organic_launches_user ON public.organic_launches (user_id);
CREATE INDEX idx_organic_launches_app ON public.organic_launches (app_id);

ALTER TABLE public.organic_launches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own launches"
  ON public.organic_launches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own launches"
  ON public.organic_launches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own launches"
  ON public.organic_launches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all launches"
  ON public.organic_launches FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_organic_launches_updated_at
  BEFORE UPDATE ON public.organic_launches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Social Posts ============
CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid NOT NULL REFERENCES public.organic_launches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  title text,
  body text NOT NULL,
  hashtags text[] NOT NULL DEFAULT ARRAY[]::text[],
  cta text,
  media_prompt text,
  target_url text NOT NULL,
  status text NOT NULL DEFAULT 'ready',
  posted_at timestamptz,
  external_post_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_launch ON public.social_posts (launch_id);
CREATE INDEX idx_social_posts_user ON public.social_posts (user_id);
CREATE INDEX idx_social_posts_platform ON public.social_posts (platform);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own posts"
  ON public.social_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own posts"
  ON public.social_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all posts"
  ON public.social_posts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEO Landing Pages ============
CREATE TABLE public.seo_landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id uuid REFERENCES public.organic_launches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_description text NOT NULL,
  headline text NOT NULL,
  subheadline text,
  body_md text NOT NULL,
  cta_text text NOT NULL DEFAULT 'Start free trial',
  target_url text NOT NULL,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  published boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_pages_user ON public.seo_landing_pages (user_id);
CREATE INDEX idx_seo_pages_app ON public.seo_landing_pages (app_id);
CREATE INDEX idx_seo_pages_slug ON public.seo_landing_pages (slug);

ALTER TABLE public.seo_landing_pages ENABLE ROW LEVEL SECURITY;

-- Public can read PUBLISHED landing pages (for SEO)
CREATE POLICY "Public reads published landing pages"
  ON public.seo_landing_pages FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Owners manage own landing pages"
  ON public.seo_landing_pages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all landing pages"
  ON public.seo_landing_pages FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER set_seo_landing_pages_updated_at
  BEFORE UPDATE ON public.seo_landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Helper: has_app_access ============
CREATE OR REPLACE FUNCTION public.has_app_access(_user_id uuid, _app_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_entitlements
    WHERE user_id = _user_id
      AND app_id = _app_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;