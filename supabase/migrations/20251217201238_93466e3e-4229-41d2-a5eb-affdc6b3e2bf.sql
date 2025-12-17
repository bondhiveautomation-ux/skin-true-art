-- Create dress_library table
CREATE TABLE public.dress_library (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('male', 'female')),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dress_library ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all dresses
CREATE POLICY "Admins can manage dress library"
ON public.dress_library
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for authenticated users to view active dresses only
CREATE POLICY "Users can view active dresses"
ON public.dress_library
FOR SELECT
USING (is_active = true);

-- Create storage bucket for dress images
INSERT INTO storage.buckets (id, name, public)
VALUES ('dress-library', 'dress-library', true);

-- Create storage policy for admin uploads
CREATE POLICY "Admins can upload dress images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'dress-library' AND has_role(auth.uid(), 'admin'::app_role));

-- Create storage policy for public read
CREATE POLICY "Anyone can view dress images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dress-library');

-- Create storage policy for admin delete
CREATE POLICY "Admins can delete dress images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'dress-library' AND has_role(auth.uid(), 'admin'::app_role));