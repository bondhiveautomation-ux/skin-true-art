-- Create site_content table for CMS functionality
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  content_key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_key, content_key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Admin can manage all content
CREATE POLICY "Admins can manage site content"
ON public.site_content
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Everyone can read active content (for displaying on the site)
CREATE POLICY "Everyone can read active site content"
ON public.site_content
FOR SELECT
USING (is_active = true);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for all sections
-- Header/Navigation
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('header', 'brand_name', 'Influencer Tool', 1),
('header', 'nav_features', 'Features', 2),
('header', 'nav_process', 'Process', 3),
('header', 'nav_studio', 'Studio', 4),
('header', 'cta_get_started', 'Get Started', 5);

-- Hero Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('hero', 'badge_text', 'AI Fashion & Beauty Studio', 1),
('hero', 'headline_1', 'Where Fashion', 2),
('hero', 'headline_2', 'Meets AI', 3),
('hero', 'subheadline', 'The ultimate creative studio for makeup artists, influencers, and fashion brands. Transform your vision with precision AI technology.', 4),
('hero', 'cta_primary', 'Enter Studio', 5),
('hero', 'cta_secondary', 'Explore Features', 6),
('hero', 'trust_text', 'Trusted by creators & brands worldwide', 7);

-- Features Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('features', 'badge_text', 'The Collection', 1),
('features', 'headline_1', 'AI-Powered', 2),
('features', 'headline_2', 'Creative Tools', 3),
('features', 'subheadline', 'A curated suite of professional tools designed for beauty artists, influencers, and fashion brands.', 4),
('features', 'section_visible', 'true', 0);

-- Feature Items (keeping feature names unchanged per instructions)
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('feature_1', 'name', 'Skin Texture Enhancement', 1),
('feature_1', 'description', 'Enhance facial skin texture naturally while preserving realism. Smooth, refine, and balance details without over-editing.', 2),
('feature_1', 'visible', 'true', 0),
('feature_2', 'name', 'Character-Consistent Image Generator', 1),
('feature_2', 'description', 'Generate new images while keeping the exact same face and identity consistent across all outputs.', 2),
('feature_2', 'visible', 'true', 0),
('feature_3', 'name', 'Image Prompt Extractor', 1),
('feature_3', 'description', 'Extract detailed AI prompts from any image to recreate, remix, or study styles with precision.', 2),
('feature_3', 'visible', 'true', 0),
('feature_4', 'name', 'Dress-to-Dummy Extractor', 1),
('feature_4', 'description', 'Isolate outfits cleanly from reference images for seamless reuse on different characters or poses.', 2),
('feature_4', 'visible', 'true', 0),
('feature_5', 'name', 'Remove People, Keep Background', 1),
('feature_5', 'description', 'Remove unwanted people while perfectly preserving the original background with AI accuracy.', 2),
('feature_5', 'visible', 'true', 0),
('feature_6', 'name', 'Pose Transfer Studio', 1),
('feature_6', 'description', 'Apply the pose from one image to another character while maintaining natural proportions and realism.', 2),
('feature_6', 'visible', 'true', 0),
('feature_7', 'name', 'Make Me Up – AI Makeup Studio', 1),
('feature_7', 'description', 'Apply professional-grade makeup styles digitally—ideal for beauty creators and makeup artists.', 2),
('feature_7', 'visible', 'true', 0),
('feature_8', 'name', 'Full Look Transfer (Face Keep)', 1),
('feature_8', 'description', 'Transfer the complete look—outfit, lighting, and style—while keeping the original face unchanged.', 2),
('feature_8', 'visible', 'true', 0),
('feature_9', 'name', 'Dress Change Studio', 1),
('feature_9', 'description', 'Try on outfits from our curated library while keeping your face and pose 100% unchanged.', 2),
('feature_9', 'visible', 'true', 0),
('feature_9', 'featured', 'true', 3);

-- How It Works Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('how_it_works', 'badge_text', 'The Process', 1),
('how_it_works', 'headline_1', 'Effortless', 2),
('how_it_works', 'headline_2', 'Elegance', 3),
('how_it_works', 'subheadline', 'Three simple steps to transform your creative vision into reality.', 4),
('how_it_works', 'section_visible', 'true', 0),
('how_it_works', 'step_1_title', 'Upload Your Image', 5),
('how_it_works', 'step_1_description', 'Select your source image in any common format. Our system handles the rest with precision.', 6),
('how_it_works', 'step_2_title', 'Choose Your Tool', 7),
('how_it_works', 'step_2_description', 'Select from our suite of AI tools tailored to your creative vision and brand aesthetic.', 8),
('how_it_works', 'step_3_title', 'Generate & Download', 9),
('how_it_works', 'step_3_description', 'Receive your results instantly in stunning high quality, ready for your content.', 10);

-- Value/Promise Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('value', 'badge_text', 'Our Promise', 1),
('value', 'headline_1', 'Built for', 2),
('value', 'headline_2', 'Excellence', 3),
('value', 'subheadline', 'Trusted by professionals who demand nothing less than perfection.', 4),
('value', 'section_visible', 'true', 0),
('value', 'item_1_title', 'Precision', 5),
('value', 'item_1_description', 'Every tool is fine-tuned for accurate, high-quality results you can rely on.', 6),
('value', 'item_2_title', 'Consistency', 7),
('value', 'item_2_description', 'Maintain identity and style across all your generated content.', 8),
('value', 'item_3_title', 'Creator-First', 9),
('value', 'item_3_description', 'Designed with the workflow of professional creators in mind.', 10),
('value', 'item_4_title', 'Professional Results', 11),
('value', 'item_4_description', 'Output quality that meets industry standards for commercial use.', 12);

-- CTA Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('cta', 'headline_1', 'Ready to', 1),
('cta', 'headline_2', 'Transform', 2),
('cta', 'subheadline', 'Join the creators shaping the future of fashion and beauty with AI.', 3),
('cta', 'button_text', 'Begin Your Journey', 4),
('cta', 'trust_text', 'No commitment required • Professional results guaranteed', 5),
('cta', 'section_visible', 'true', 0);

-- Footer Section
INSERT INTO public.site_content (section_key, content_key, value, display_order) VALUES
('footer', 'brand_name', 'Influencer Tool', 1),
('footer', 'tagline', 'AI-powered tools for the modern creator', 2),
('footer', 'copyright', '© {year} Influencer Tool. Crafted with elegance. All rights reserved.', 3),
('footer', 'link_privacy', 'Privacy', 4),
('footer', 'link_terms', 'Terms', 5),
('footer', 'link_contact', 'Contact', 6);