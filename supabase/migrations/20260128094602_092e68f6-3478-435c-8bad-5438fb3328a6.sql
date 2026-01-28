-- Create logo_generations table for storing user logo generation history
CREATE TABLE public.logo_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_name text NOT NULL,
  inputs_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  images_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.logo_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations
CREATE POLICY "Users can view their own logo generations"
ON public.logo_generations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert their own logo generations"
ON public.logo_generations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
CREATE POLICY "Users can update their own logo generations"
ON public.logo_generations
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own generations
CREATE POLICY "Users can delete their own logo generations"
ON public.logo_generations
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all generations
CREATE POLICY "Admins can view all logo generations"
ON public.logo_generations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all generations
CREATE POLICY "Admins can manage all logo generations"
ON public.logo_generations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_logo_generations_updated_at
BEFORE UPDATE ON public.logo_generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the tool config for Luxury Logo Generator
INSERT INTO public.tool_configs (tool_id, name, short_name, description, long_description, badge, is_active, display_order)
VALUES (
  'logo-generator',
  'Luxury Logo Generator',
  'Logo',
  'Create unique, luxurious, timeless logos for your brand with AI precision.',
  'Generate agency-quality luxury logos in minutes. Choose from multiple style options, typography directions, and color palettes to create a premium brand identity that stands out.',
  'Brand AI',
  true,
  15
);

-- Insert the gem cost for logo generation (15 gems)
INSERT INTO public.feature_gem_costs (feature_key, feature_name, gem_cost, category, is_active)
VALUES (
  'generate-logo',
  'Luxury Logo Generator',
  15,
  'high-impact',
  true
);