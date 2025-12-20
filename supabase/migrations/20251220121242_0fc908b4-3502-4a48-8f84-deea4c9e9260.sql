-- Ensure generation history can be written by the user who generated it
-- (This fixes cases where client-side logging fails due to missing INSERT policies)

ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Users can insert their own history
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'generation_history'
      AND policyname = 'Users can insert their own history'
  ) THEN
    CREATE POLICY "Users can insert their own history"
    ON public.generation_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Admins can insert history for any user (useful for server-side logging)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'generation_history'
      AND policyname = 'Admins can insert any history'
  ) THEN
    CREATE POLICY "Admins can insert any history"
    ON public.generation_history
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
