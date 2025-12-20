-- Create user_presence table for tracking online status and current page
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_page_name TEXT,
  current_path TEXT,
  entered_at TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Users can update their own presence
CREATE POLICY "Users can upsert their own presence"
ON public.user_presence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all presence data
CREATE POLICY "Admins can view all presence"
ON public.user_presence
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for user_presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Create admin_messages table for direct messaging
CREATE TABLE public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  is_from_admin BOOLEAN NOT NULL DEFAULT true,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_messages
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own messages"
ON public.admin_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can send messages (reply to admin)
CREATE POLICY "Users can send replies"
ON public.admin_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_from_admin = false);

-- Users can mark their messages as read
CREATE POLICY "Users can mark messages as read"
ON public.admin_messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.admin_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can send messages
CREATE POLICY "Admins can send messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND is_from_admin = true);

-- Admins can update any message
CREATE POLICY "Admins can update messages"
ON public.admin_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for admin_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;

-- Create trigger to update updated_at on user_presence
CREATE TRIGGER update_user_presence_updated_at
BEFORE UPDATE ON public.user_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();