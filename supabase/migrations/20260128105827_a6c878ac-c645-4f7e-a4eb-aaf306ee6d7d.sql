-- Update handle_new_user to give 50 gems instead of 100
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Give new users 50 starter gems (reduced from 100)
  INSERT INTO public.user_credits (user_id, gems_balance)
  VALUES (new.id, 50);
  
  RETURN new;
END;
$function$;