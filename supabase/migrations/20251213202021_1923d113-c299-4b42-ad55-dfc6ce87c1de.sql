-- Create user_credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to deduct credits (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM public.user_credits WHERE user_id = p_user_id;
  
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RETURN -1; -- No credits available
  END IF;
  
  UPDATE public.user_credits 
  SET credits = credits - 1, updated_at = now() 
  WHERE user_id = p_user_id;
  
  RETURN current_credits - 1;
END;
$$;

-- Create function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM public.user_credits WHERE user_id = p_user_id;
  RETURN COALESCE(current_credits, 0);
END;
$$;

-- Update handle_new_user to also create credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (new.id, 10);
  
  RETURN new;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();