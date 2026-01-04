-- Create classes table for fully editable class/course content
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Header section
  badge_text TEXT NOT NULL DEFAULT 'Program',
  duration_text TEXT NOT NULL DEFAULT '3 Days Program',
  title TEXT NOT NULL DEFAULT 'Program Title',
  -- Features/curriculum items stored as JSONB array
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Meta info
  days_online TEXT NOT NULL DEFAULT '3 Days Online',
  hours TEXT NOT NULL DEFAULT '6 Hours',
  support_text TEXT NOT NULL DEFAULT 'Long Term Support',
  -- Pricing
  price INTEGER NOT NULL DEFAULT 0,
  price_label TEXT NOT NULL DEFAULT 'Training Fee',
  bkash_number TEXT DEFAULT '01328845972',
  -- CTA
  cta_text TEXT NOT NULL DEFAULT 'Get a Call / Enroll Interest',
  cta_link TEXT DEFAULT NULL,
  cta_type TEXT NOT NULL DEFAULT 'modal' CHECK (cta_type IN ('modal', 'whatsapp', 'phone', 'link')),
  -- Display settings
  is_popular BOOLEAN NOT NULL DEFAULT false,
  icon_type TEXT NOT NULL DEFAULT 'zap' CHECK (icon_type IN ('zap', 'sparkles', 'star', 'crown', 'graduation')),
  color_theme TEXT NOT NULL DEFAULT 'gold' CHECK (color_theme IN ('gold', 'rose-gold')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes_page_settings table for hero section and other page-level content
CREATE TABLE public.classes_page_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default page settings
INSERT INTO public.classes_page_settings (setting_key, setting_value) VALUES
  ('hero_badge', 'BondHive Education'),
  ('hero_title_highlight', 'BondHive'),
  ('hero_title_suffix', ' — The CEO Launchpad'),
  ('hero_subtitle', 'এফ-কমার্স ব্যবসাকে <span class="text-gold font-semibold">Stable, Organized & Predictable Profit System</span> এ রূপান্তর করার প্রোগ্রাম');

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes_page_settings ENABLE ROW LEVEL SECURITY;

-- RLS for classes
CREATE POLICY "Anyone can view active classes" ON public.classes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for classes_page_settings
CREATE POLICY "Anyone can view active page settings" ON public.classes_page_settings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage page settings" ON public.classes_page_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_page_settings_updated_at
  BEFORE UPDATE ON public.classes_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();