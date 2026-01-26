-- Create analytics_events table for tracking user engagement
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for all (anonymous tracking)
CREATE POLICY "Allow anonymous analytics inserts"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Create promo_codes table for discount management
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  stripe_coupon_id TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_tiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active promo codes (to validate)
CREATE POLICY "Public can read active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Policy: Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON public.email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can manage all email logs
CREATE POLICY "Admins can manage email logs"
  ON public.email_logs
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create indexes for better query performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);