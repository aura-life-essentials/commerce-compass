-- Drop the existing overly permissive policies on stores
DROP POLICY IF EXISTS "Allow public read access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow public insert to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow public update to stores" ON public.stores;

-- Create restrictive policies - only service role can access store data
CREATE POLICY "Service role only read stores" 
ON public.stores 
FOR SELECT 
TO service_role 
USING (true);

CREATE POLICY "Service role only insert stores" 
ON public.stores 
FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role only update stores" 
ON public.stores 
FOR UPDATE 
TO service_role 
USING (true);