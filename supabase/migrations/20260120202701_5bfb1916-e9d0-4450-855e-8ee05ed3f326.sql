-- Create table for editable tool configurations
CREATE TABLE public.tool_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    badge TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_configs ENABLE ROW LEVEL SECURITY;

-- Everyone can read active tools
CREATE POLICY "Anyone can read active tools"
ON public.tool_configs
FOR SELECT
USING (is_active = true);

-- Admins can read all tools
CREATE POLICY "Admins can read all tools"
ON public.tool_configs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update tools
CREATE POLICY "Admins can update tools"
ON public.tool_configs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert tools
CREATE POLICY "Admins can insert tools"
ON public.tool_configs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete tools
CREATE POLICY "Admins can delete tools"
ON public.tool_configs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_tool_configs_updated_at
BEFORE UPDATE ON public.tool_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tool configurations
INSERT INTO public.tool_configs (tool_id, name, short_name, description, long_description, badge, display_order) VALUES
('character-generator', 'Character Generator', 'Character', 'Generate new images while keeping your character''s face and identity perfectly consistent.', 'Create stunning, character-consistent images with AI. Upload a reference photo and generate new scenarios, outfits, and backgrounds while maintaining 100% identity consistency.', 'AI Identity', 1),
('prompt-extractor', 'Prompt Extractor', 'Prompt', 'Extract detailed AI prompts from any image to recreate similar visuals.', 'Analyze any image in extreme detail and extract a comprehensive AI prompt. Perfect for understanding how to recreate specific styles, compositions, and aesthetics.', 'Quick Tool', 2),
('dress-extractor', 'Dress Extractor', 'Dress', 'Isolate outfits from photos and display them on professional mannequins.', 'Extract garments from any photo and place them on elegant mannequins with premium backgrounds. Perfect for e-commerce product displays and fashion catalogs.', 'E-Commerce', 3),
('background-saver', 'Background Saver', 'Background', 'Remove unwanted people from photos while preserving the background perfectly.', 'Intelligently remove people from your photos while keeping the background intact and natural. Ideal for real estate, travel, and product photography.', 'Cleanup', 4),
('pose-transfer', 'Pose Transfer', 'Pose', 'Transfer poses from reference images while keeping your character''s identity.', 'Apply any pose from a reference image onto your character while preserving their face, body, outfit, and style. Create dynamic content without photoshoots.', 'High-Impact', 5),
('makeup-studio', 'Makeup Studio', 'Makeup', 'Apply professional makeup styles to portraits with AI precision.', 'Transform any portrait with professional-grade makeup styles. Choose from curated presets or customize looks while maintaining natural skin texture.', 'Beauty', 6),
('face-swap', 'Face Swap Studio', 'Swap', 'Seamlessly swap faces between images with professional quality.', 'Transfer faces between photos with AI precision. Perfect for content creation, marketing visuals, and creative projects.', 'High-Impact', 7),
('cinematic-studio', 'Cinematic Studio', 'Cinematic', 'Transform photos into stunning cinematic shots with one click.', 'Apply professional cinematic styles and backgrounds to your photos. Perfect for bridal photography, fashion shoots, and editorial content.', 'Editorial', 8),
('background-creator', 'Background Creator', 'BG Create', 'Generate beautiful AI backgrounds for your product photography.', 'Create stunning, professional backgrounds using AI. Choose from curated presets or describe your ideal backdrop for product and portrait photography.', 'Creative', 9),
('photography-studio', 'Photography Studio', 'Photo', 'Transform raw photos into DSLR-quality professional images.', 'Enhance your photos to ultra-HD DSLR quality with AI. Automatic fixes for angle, framing, lighting, and composition while preserving identity.', 'Studio', 10),
('caption-studio', 'Caption Studio', 'Caption', 'Generate high-converting product captions in Bangla or English.', 'Create CTA-ready product captions with AI. Customize language, tone, length, and emoji style for your perfect social media content.', 'Quick Tool', 11),
('branding-studio', 'Branding Studio', 'Brand', 'Apply logos and watermarks professionally to protect your content.', 'Add professional branding to your images. Control logo position, transparency, and style with batch processing support.', 'Protect', 12);