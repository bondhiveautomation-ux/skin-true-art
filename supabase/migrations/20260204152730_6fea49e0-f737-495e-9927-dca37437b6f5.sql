
-- Fix admin_update_gems to log transactions when admin adjusts gems
CREATE OR REPLACE FUNCTION public.admin_update_gems(
  p_admin_id uuid, 
  p_target_user_id uuid, 
  p_gems integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_balance INTEGER;
  gem_diff INTEGER;
BEGIN
  -- Verify admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;
  
  -- Get current balance
  SELECT gems_balance INTO old_balance 
  FROM public.user_credits 
  WHERE user_id = p_target_user_id;
  
  -- Calculate difference
  gem_diff := p_gems - COALESCE(old_balance, 0);
  
  -- Update the gems balance
  UPDATE public.user_credits
  SET gems_balance = p_gems, updated_at = now()
  WHERE user_id = p_target_user_id;
  
  -- Log the transaction if there's a change
  IF gem_diff != 0 THEN
    INSERT INTO public.gem_transactions (
      user_id, 
      transaction_type, 
      feature_used, 
      gems_amount, 
      gems_balance_after
    ) VALUES (
      p_target_user_id, 
      CASE WHEN gem_diff > 0 THEN 'admin_add' ELSE 'admin_subtract' END,
      'Admin adjustment',
      gem_diff,
      p_gems
    );
  END IF;
  
  RETURN TRUE;
END;
$function$;
