-- Create pricing_config table for dynamic gem package pricing
CREATE TABLE public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_key text UNIQUE NOT NULL,
  package_name text NOT NULL,
  gems integer NOT NULL,
  price_bdt integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read active pricing
CREATE POLICY "Anyone can view active pricing" 
ON public.pricing_config 
FOR SELECT 
USING (is_active = true);

-- Admins can manage pricing
CREATE POLICY "Admins can manage pricing" 
ON public.pricing_config 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert default pricing packages
INSERT INTO public.pricing_config (package_key, package_name, gems, price_bdt, display_order) VALUES
('7_day', '7-Day Pack', 150, 99, 1),
('monthly', 'Monthly Pack', 500, 299, 2),
('topup_small', 'Small Top-up', 50, 49, 3),
('topup_medium', 'Medium Top-up', 100, 89, 4),
('topup_large', 'Large Top-up', 250, 199, 5);

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_config_updated_at
BEFORE UPDATE ON public.pricing_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();