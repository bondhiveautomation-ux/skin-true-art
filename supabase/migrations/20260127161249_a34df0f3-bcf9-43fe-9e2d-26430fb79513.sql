-- Create storage bucket for tool preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-previews', 'tool-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view tool preview images
CREATE POLICY "Tool previews are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tool-previews');

-- Allow admins to upload tool preview images
CREATE POLICY "Admins can upload tool previews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tool-previews' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update tool preview images
CREATE POLICY "Admins can update tool previews"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tool-previews' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete tool preview images
CREATE POLICY "Admins can delete tool previews"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tool-previews' 
  AND has_role(auth.uid(), 'admin'::app_role)
);