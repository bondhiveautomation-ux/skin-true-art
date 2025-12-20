-- Allow admins to delete generation history entries
CREATE POLICY "Admins can delete history entries"
ON public.generation_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));