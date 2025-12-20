-- Create payment request status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create payment requests table
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  txid TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_request_id UUID NOT NULL REFERENCES public.payment_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Payment requests policies
CREATE POLICY "Users can view their own payment requests"
ON public.payment_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests"
ON public.payment_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own payment requests"
ON public.payment_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any payment request"
ON public.payment_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Chat messages policies
CREATE POLICY "Users can view messages for their payment requests"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.payment_requests pr
    WHERE pr.id = payment_request_id AND pr.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can send messages on their payment requests"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.payment_requests pr
    WHERE pr.id = payment_request_id AND pr.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can send messages on any payment request"
ON public.chat_messages FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') AND is_admin = true
);

-- Create function for admin to approve payment and add credits
CREATE OR REPLACE FUNCTION public.approve_payment(
  p_admin_id UUID,
  p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_credits INTEGER;
  v_status payment_status;
BEGIN
  -- Check admin role
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  -- Get request details
  SELECT user_id, credits, status INTO v_user_id, v_credits, v_status
  FROM public.payment_requests
  WHERE id = p_request_id;

  -- Check if already approved
  IF v_status = 'approved' THEN
    RETURN FALSE;
  END IF;

  -- Update request status
  UPDATE public.payment_requests
  SET status = 'approved', updated_at = now()
  WHERE id = p_request_id;

  -- Add credits to user
  UPDATE public.user_credits
  SET credits = credits + v_credits, updated_at = now()
  WHERE user_id = v_user_id;

  RETURN TRUE;
END;
$$;

-- Create function to reject payment
CREATE OR REPLACE FUNCTION public.reject_payment(
  p_admin_id UUID,
  p_request_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  UPDATE public.payment_requests
  SET status = 'rejected', admin_notes = p_notes, updated_at = now()
  WHERE id = p_request_id;

  RETURN TRUE;
END;
$$;

-- Create function to check duplicate TxID
CREATE OR REPLACE FUNCTION public.check_duplicate_txid(p_txid TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.payment_requests
    WHERE txid = p_txid AND status = 'approved'
  );
$$;

-- Trigger for updated_at
CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();