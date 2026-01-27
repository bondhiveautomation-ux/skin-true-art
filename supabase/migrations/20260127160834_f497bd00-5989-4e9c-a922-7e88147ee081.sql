-- Add image_url column to tool_configs for admin-controlled preview images
ALTER TABLE public.tool_configs 
ADD COLUMN IF NOT EXISTS preview_image_url TEXT DEFAULT NULL;