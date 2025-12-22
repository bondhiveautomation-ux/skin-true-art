-- Create a function for admins to set user subscription periods
CREATE OR REPLACE FUNCTION public.admin_set_subscription(
  p_admin_id uuid, 
  p_target_user_id uuid, 
  p_subscription_type text,
  p_days integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;
  
  -- Update subscription info
  UPDATE public.user_credits
  SET 
    subscription_type = p_subscription_type,
    subscription_expires_at = now() + (p_days || ' days')::interval,
    updated_at = now()
  WHERE user_id = p_target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create a function for admins to clear subscription
CREATE OR REPLACE FUNCTION public.admin_clear_subscription(
  p_admin_id uuid, 
  p_target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;
  
  -- Clear subscription info
  UPDATE public.user_credits
  SET 
    subscription_type = NULL,
    subscription_expires_at = NULL,
    updated_at = now()
  WHERE user_id = p_target_user_id;
  
  RETURN TRUE;
END;
$$;