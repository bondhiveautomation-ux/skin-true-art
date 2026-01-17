-- Create table to store configurable gem costs per feature
CREATE TABLE public.feature_gem_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  gem_cost INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'quick-tools',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_gem_costs ENABLE ROW LEVEL SECURITY;

-- Everyone can read gem costs (needed for frontend display)
CREATE POLICY "Anyone can read feature gem costs"
ON public.feature_gem_costs
FOR SELECT
USING (true);

-- Only admins can modify gem costs
CREATE POLICY "Admins can manage feature gem costs"
ON public.feature_gem_costs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_feature_gem_costs_updated_at
BEFORE UPDATE ON public.feature_gem_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default values for all features
INSERT INTO public.feature_gem_costs (feature_key, feature_name, gem_cost, category) VALUES
  ('dress-change', 'Dress Change Studio', 15, 'high-impact'),
  ('apply-makeup', 'Makeup Application', 15, 'high-impact'),
  ('generate-character-image', 'Character Generator', 15, 'high-impact'),
  ('pose-transfer', 'Pose Transfer', 15, 'high-impact'),
  ('face-swap', 'Face Swap', 15, 'high-impact'),
  ('cinematic-transform', 'Cinematic Studio', 15, 'high-impact'),
  ('extract-dress-to-dummy', 'Dress Extractor', 15, 'high-impact'),
  ('generate-background', 'Background Creator', 15, 'high-impact'),
  ('enhance-photo', 'Photo Enhancer', 12, 'studio-utility'),
  ('apply-branding', 'Apply Branding', 12, 'studio-utility'),
  ('remove-people-from-image', 'Remove People', 12, 'studio-utility'),
  ('generate-caption', 'Caption Generator', 1, 'quick-tools'),
  ('extract-image-prompt', 'Extract Prompt', 1, 'quick-tools'),
  ('refine-prompt', 'Refine Prompt', 1, 'quick-tools')
ON CONFLICT (feature_key) DO NOTHING;