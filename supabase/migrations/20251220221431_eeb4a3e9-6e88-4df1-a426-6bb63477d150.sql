-- Update the handle_new_user function to auto-block spam email domains
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  should_block BOOLEAN := FALSE;
BEGIN
  user_email := LOWER(new.email);
  
  -- Check for blocked email domains
  IF user_email LIKE '%@mailbox.in.ua' THEN
    should_block := TRUE;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, is_blocked)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name', should_block);
  
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (new.id, 10);
  
  RETURN new;
END;
$$;