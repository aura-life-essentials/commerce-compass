
CREATE TABLE public.content_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  product_data JSONB,
  source TEXT NOT NULL DEFAULT 'viral_research',
  platform TEXT NOT NULL DEFAULT 'youtube_shorts',
  script TEXT,
  video_request_id TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  post_id TEXT,
  post_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stage TEXT NOT NULL DEFAULT 'research',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to content_pipeline" ON public.content_pipeline
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_content_pipeline_updated_at
  BEFORE UPDATE ON public.content_pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
