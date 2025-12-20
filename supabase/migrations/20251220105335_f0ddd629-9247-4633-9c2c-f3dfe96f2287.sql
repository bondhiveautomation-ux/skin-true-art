-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'enrolled');

-- Create class_leads table
CREATE TABLE public.class_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT NOT NULL,
  business_page_name TEXT NOT NULL,
  program TEXT NOT NULL CHECK (program IN ('3_days', '5_days')),
  business_category TEXT,
  monthly_ad_spend TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert leads (public form)
CREATE POLICY "Anyone can submit a lead"
ON public.class_leads
FOR INSERT
WITH CHECK (true);

-- Only admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.class_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update leads
CREATE POLICY "Admins can update leads"
ON public.class_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete leads
CREATE POLICY "Admins can delete leads"
ON public.class_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_class_leads_updated_at
BEFORE UPDATE ON public.class_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();