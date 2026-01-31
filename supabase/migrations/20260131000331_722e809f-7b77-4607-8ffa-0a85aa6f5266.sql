-- Create table for landing page examples
CREATE TABLE public.landing_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key TEXT NOT NULL UNIQUE,
  category_name TEXT NOT NULL,
  category_name_bn TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_examples ENABLE ROW LEVEL SECURITY;

-- Public read access (for landing page)
CREATE POLICY "Landing examples are publicly viewable"
ON public.landing_examples
FOR SELECT
USING (true);

-- Admin can manage examples
CREATE POLICY "Admins can manage landing examples"
ON public.landing_examples
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default categories
INSERT INTO public.landing_examples (category_key, category_name, category_name_bn, display_order) VALUES
('product_photography', 'Product Photography', 'প্রোডাক্ট ফটোগ্রাফি', 1),
('fashion_lookbook', 'Fashion Lookbook', 'ফ্যাশন লুকবুক', 2),
('brand_identity', 'Brand Identity', 'ব্র্যান্ড আইডেন্টিটি', 3),
('social_media', 'Social Media Posts', 'সোশ্যাল মিডিয়া পোস্ট', 4),
('makeup_portfolio', 'Makeup Portfolio', 'মেকআপ পোর্টফোলিও', 5),
('event_visuals', 'Event Visuals', 'ইভেন্ট ভিজ্যুয়াল', 6);

-- Create storage bucket for landing examples
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-examples', 'landing-examples', true);

-- Storage policies
CREATE POLICY "Landing examples images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'landing-examples');

CREATE POLICY "Admins can upload landing example images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'landing-examples' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update landing example images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'landing-examples' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete landing example images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'landing-examples' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_landing_examples_updated_at
BEFORE UPDATE ON public.landing_examples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();