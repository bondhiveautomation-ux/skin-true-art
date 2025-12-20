-- Add current_tool column to track which tool the user is actively using
ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS current_tool text;