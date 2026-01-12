-- Create table to track generation counter resets
CREATE TABLE public.generation_counter_resets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reset_by UUID NOT NULL,
    note TEXT
);

-- Enable RLS
ALTER TABLE public.generation_counter_resets ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage resets
CREATE POLICY "Admins can view generation counter resets"
ON public.generation_counter_resets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert generation counter resets"
ON public.generation_counter_resets
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));