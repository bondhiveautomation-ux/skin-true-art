-- Rename credits to gems in user_credits table for clarity
ALTER TABLE public.user_credits RENAME COLUMN credits TO gems_balance;

-- Add expiry tracking for subscription gems
ALTER TABLE public.user_credits 
ADD COLUMN subscription_type text DEFAULT NULL,
ADD COLUMN subscription_expires_at timestamp with time zone DEFAULT NULL;

-- Create gem_transactions table for tracking all gem activity
CREATE TABLE public.gem_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_type text NOT NULL, -- 'spend', 'topup', 'subscription'
  feature_used text DEFAULT NULL, -- which feature consumed gems
  gems_amount integer NOT NULL, -- positive for topup, negative for spend
  gems_balance_after integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on gem_transactions
ALTER TABLE public.gem_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for gem_transactions
CREATE POLICY "Users can view their own transactions"
ON public.gem_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.gem_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.gem_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Drop old functions
DROP FUNCTION IF EXISTS public.deduct_credit(uuid);
DROP FUNCTION IF EXISTS public.get_user_credits(uuid);

-- Create new get_user_gems function
CREATE OR REPLACE FUNCTION public.get_user_gems(p_user_id uuid)
RETURNS TABLE(gems_balance integer, subscription_type text, subscription_expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT uc.gems_balance, uc.subscription_type, uc.subscription_expires_at
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
END;
$$;

-- Create deduct_gems function with feature-based costs
CREATE OR REPLACE FUNCTION public.deduct_gems(p_user_id uuid, p_feature_name text, p_gem_cost integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_gems INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current gems
  SELECT gems_balance INTO current_gems FROM public.user_credits WHERE user_id = p_user_id;
  
  IF current_gems IS NULL OR current_gems < p_gem_cost THEN
    RETURN -1; -- Not enough gems
  END IF;
  
  new_balance := current_gems - p_gem_cost;
  
  -- Update gems balance
  UPDATE public.user_credits 
  SET gems_balance = new_balance, updated_at = now() 
  WHERE user_id = p_user_id;
  
  -- Log the transaction
  INSERT INTO public.gem_transactions (user_id, transaction_type, feature_used, gems_amount, gems_balance_after)
  VALUES (p_user_id, 'spend', p_feature_name, -p_gem_cost, new_balance);
  
  RETURN new_balance;
END;
$$;

-- Create add_gems function for topups
CREATE OR REPLACE FUNCTION public.add_gems(p_user_id uuid, p_gems integer, p_transaction_type text, p_subscription_type text DEFAULT NULL, p_expires_at timestamp with time zone DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_gems INTEGER;
  new_balance INTEGER;
BEGIN
  SELECT gems_balance INTO current_gems FROM public.user_credits WHERE user_id = p_user_id;
  current_gems := COALESCE(current_gems, 0);
  new_balance := current_gems + p_gems;
  
  -- Update gems balance and subscription info
  UPDATE public.user_credits 
  SET gems_balance = new_balance, 
      updated_at = now(),
      subscription_type = COALESCE(p_subscription_type, subscription_type),
      subscription_expires_at = COALESCE(p_expires_at, subscription_expires_at)
  WHERE user_id = p_user_id;
  
  -- Log the transaction
  INSERT INTO public.gem_transactions (user_id, transaction_type, gems_amount, gems_balance_after)
  VALUES (p_user_id, p_transaction_type, p_gems, new_balance);
  
  RETURN new_balance;
END;
$$;

-- Update approve_payment to use new gems system
CREATE OR REPLACE FUNCTION public.approve_payment(p_admin_id uuid, p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_credits INTEGER;
  v_status payment_status;
  v_package_name TEXT;
BEGIN
  -- Check admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  -- Get request details
  SELECT user_id, credits, status, package_name INTO v_user_id, v_credits, v_status, v_package_name
  FROM public.payment_requests
  WHERE id = p_request_id;

  -- Check if already approved
  IF v_status = 'approved' THEN
    RETURN FALSE;
  END IF;

  -- Update request status
  UPDATE public.payment_requests
  SET status = 'approved', updated_at = now()
  WHERE id = p_request_id;

  -- Add gems to user using the new function
  PERFORM public.add_gems(v_user_id, v_credits, 'topup', NULL, NULL);

  RETURN TRUE;
END;
$$;

-- Update admin_update_credits to work with gems
CREATE OR REPLACE FUNCTION public.admin_update_gems(p_admin_id uuid, p_target_user_id uuid, p_gems integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.user_credits
  SET gems_balance = p_gems, updated_at = now()
  WHERE user_id = p_target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Update handle_new_user to give 50 starter gems instead of 5 credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  email_domain TEXT;
  should_block BOOLEAN := FALSE;
BEGIN
  user_email := LOWER(new.email);
  email_domain := split_part(user_email, '@', 2);
  
  -- Only allow gmail.com, yahoo.com, and outlook.com domains
  IF email_domain NOT IN ('gmail.com', 'yahoo.com', 'outlook.com') THEN
    should_block := TRUE;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, is_blocked)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name', should_block);
  
  -- Give new users 50 starter gems
  INSERT INTO public.user_credits (user_id, gems_balance)
  VALUES (new.id, 50);
  
  RETURN new;
END;
$$;