-- Update the default credits value on the table
ALTER TABLE public.user_credits ALTER COLUMN credits SET DEFAULT 5;

-- Update the handle_new_user function to give 5 credits instead of 10
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
  
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (new.id, 5);
  
  RETURN new;
END;
$function$;