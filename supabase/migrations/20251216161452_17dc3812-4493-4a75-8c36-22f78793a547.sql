-- Add columns for storing input and output image URLs
ALTER TABLE public.generation_history 
ADD COLUMN IF NOT EXISTS input_images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS output_images text[] DEFAULT '{}';

-- Create storage bucket for generation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generation-images', 'generation-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to generation-images bucket
CREATE POLICY "Authenticated users can upload generation images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generation-images');

-- Allow public read access to generation images
CREATE POLICY "Anyone can view generation images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'generation-images');

-- Allow users to delete their own generation images
CREATE POLICY "Users can delete their own generation images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'generation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update the log_generation function to accept image URLs
CREATE OR REPLACE FUNCTION public.log_generation(
  p_user_id uuid, 
  p_feature_name text,
  p_input_images text[] DEFAULT '{}',
  p_output_images text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.generation_history (user_id, feature_name, input_images, output_images)
  VALUES (p_user_id, p_feature_name, p_input_images, p_output_images)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;