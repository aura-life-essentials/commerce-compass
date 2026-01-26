-- Add unique constraint on source_url for viral_content table
ALTER TABLE public.viral_content ADD CONSTRAINT viral_content_source_url_key UNIQUE (source_url);