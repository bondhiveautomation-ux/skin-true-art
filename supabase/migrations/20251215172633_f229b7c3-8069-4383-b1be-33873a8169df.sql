-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can view all history" ON public.generation_history;
DROP POLICY IF EXISTS "Users can view their own history" ON public.generation_history;

-- Create permissive policies (OR logic - any matching policy grants access)
CREATE POLICY "Admins can view all history" 
ON public.generation_history 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own history" 
ON public.generation_history 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);