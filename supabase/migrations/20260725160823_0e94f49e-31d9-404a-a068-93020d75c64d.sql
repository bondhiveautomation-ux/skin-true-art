
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'sm.tariq.ibrahim@gmail.com';

INSERT INTO public.profiles (user_id, email, full_name, is_blocked)
SELECT id, email, 'Admin', false FROM auth.users WHERE email = 'sm.tariq.ibrahim@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET is_blocked = false;

INSERT INTO public.user_credits (user_id, gems_balance)
SELECT id, 9999 FROM auth.users WHERE email = 'sm.tariq.ibrahim@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'sm.tariq.ibrahim@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
