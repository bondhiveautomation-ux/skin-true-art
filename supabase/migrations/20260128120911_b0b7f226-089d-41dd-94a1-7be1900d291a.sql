-- Create tool_departments table for organizing tools
CREATE TABLE public.tool_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bangla_name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_departments ENABLE ROW LEVEL SECURITY;

-- Anyone can read active departments
CREATE POLICY "Anyone can read active departments"
ON public.tool_departments
FOR SELECT
USING (is_active = true);

-- Admins can read all departments
CREATE POLICY "Admins can read all departments"
ON public.tool_departments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage departments
CREATE POLICY "Admins can insert departments"
ON public.tool_departments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update departments"
ON public.tool_departments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete departments"
ON public.tool_departments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add department_id column to tool_configs
ALTER TABLE public.tool_configs 
ADD COLUMN department_id UUID REFERENCES public.tool_departments(id) ON DELETE SET NULL;

-- Insert default departments
INSERT INTO public.tool_departments (name, bangla_name, description, display_order) VALUES
('Creative Studio', 'ক্রিয়েটিভ স্টুডিও', 'AI-powered character and logo generation tools', 1),
('Photography Suite', 'ফটোগ্রাফি স্যুট', 'Professional photo enhancement and editing', 2),
('Video & Cinema', 'ভিডিও ও সিনেমা', 'Cinematic transformations and video creation', 3),
('Fashion & Beauty', 'ফ্যাশন ও বিউটি', 'Makeup, dress extraction and style tools', 4),
('Content Tools', 'কন্টেন্ট টুলস', 'Captions, prompts and branding utilities', 5);

-- Update trigger for updated_at
CREATE TRIGGER update_tool_departments_updated_at
BEFORE UPDATE ON public.tool_departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();