-- Lock down the content_pipeline table by replacing the public-all-access policy.
DROP POLICY IF EXISTS "Allow all access to content_pipeline" ON public.content_pipeline;

CREATE POLICY "Service role manages content_pipeline"
ON public.content_pipeline
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins manage content_pipeline"
ON public.content_pipeline
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));