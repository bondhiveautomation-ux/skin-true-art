-- Create temp-uploads bucket for temporary file storage (video generation input images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temp-uploads', 
  'temp-uploads', 
  true,
  20971520,  -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to temp-uploads
CREATE POLICY "Public read access for temp-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'temp-uploads');

-- Allow authenticated users to upload to temp-uploads
CREATE POLICY "Authenticated users can upload to temp-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'temp-uploads');

-- Allow service role to manage temp-uploads (for edge functions)
CREATE POLICY "Service role can manage temp-uploads"
ON storage.objects FOR ALL
USING (bucket_id = 'temp-uploads');