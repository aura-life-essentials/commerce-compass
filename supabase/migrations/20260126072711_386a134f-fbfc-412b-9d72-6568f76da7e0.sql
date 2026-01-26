-- Drop the existing overly permissive policies on stripe_transactions
DROP POLICY IF EXISTS "Public read stripe_transactions" ON public.stripe_transactions;
DROP POLICY IF EXISTS "Public insert stripe_transactions" ON public.stripe_transactions;

-- Create restrictive policy - only service role (webhooks) can insert
-- No public SELECT access at all - only backend can access this data
CREATE POLICY "Service role only insert stripe_transactions" 
ON public.stripe_transactions 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- No SELECT policy for anon or authenticated users
-- This means only service_role (edge functions) can read this data
CREATE POLICY "Service role only read stripe_transactions" 
ON public.stripe_transactions 
FOR SELECT 
TO service_role 
USING (true);