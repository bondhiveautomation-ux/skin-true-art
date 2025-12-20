-- Add is_blocked column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Create a function to block/unblock users (admin only)
CREATE OR REPLACE FUNCTION public.admin_toggle_block_user(p_admin_id uuid, p_target_user_id uuid, p_blocked boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  -- Update the blocked status
  UPDATE public.profiles
  SET is_blocked = p_blocked, updated_at = now()
  WHERE user_id = p_target_user_id;

  RETURN TRUE;
END;
$$;