-- Supabase Migration: Initialize Photos Table and Storage Policies

-- Photos Table
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    src TEXT NOT NULL, -- URL from Supabase Storage
    alt TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for ordering
CREATE INDEX idx_photos_display_order ON public.photos(display_order ASC);
CREATE INDEX idx_photos_created_at ON public.photos(created_at DESC);


-- RLS Policies for photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read photos
CREATE POLICY "Public can read photos"
ON public.photos
FOR SELECT
USING (true);

-- Policy: Authenticated service_role can do anything (for server-side admin actions)
-- Admin actions will be performed using a Supabase client initialized with the service_role key.
CREATE POLICY "Service role has full access to photos"
ON public.photos
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');


-- Trigger to update `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at
BEFORE UPDATE ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Supabase Storage Bucket: 'photoflow_photos'
-- IMPORTANT: You need to create this bucket manually in your Supabase project dashboard (Storage -> Buckets -> Create bucket).
-- Set the bucket to be Public if you want direct public URLs. Otherwise, you'll need to generate signed URLs.
-- For this example, we assume the 'photoflow_photos' bucket is created and public.

-- RLS Policies for storage.objects (related to 'photoflow_photos' bucket)

-- Policy: Allow public read access to objects in the 'photoflow_photos' bucket
-- This policy allows anyone to read files if the bucket is public and file URLs are known.
CREATE POLICY "Public can view photos in photoflow_photos bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'photoflow_photos'); -- Make sure 'photoflow_photos' matches your bucket name.

-- Policy: Service role can manage all objects in 'photoflow_photos' bucket
-- This allows server-side actions (uploads, deletes) using the service_role key to bypass more restrictive RLS.
CREATE POLICY "Service role can manage all objects in photoflow_photos bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'photoflow_photos' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'photoflow_photos' AND auth.role() = 'service_role');

-- Optional: If you want to allow authenticated users (not just service_role) to upload via client,
-- you would need a more specific policy like:
-- CREATE POLICY "Authenticated users can upload to photoflow_photos"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'photoflow_photos');
-- And similar for delete/update.
-- For this admin panel with server actions, the service_role policies are sufficient and simpler.
