-- Create scheduled_gifts table for gifts that should be sent on a future date
CREATE TABLE IF NOT EXISTS public.scheduled_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code TEXT NOT NULL UNIQUE,
  recipient_email TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_user_id UUID,
  sender_name TEXT,
  gift_message TEXT,
  scheduled_send_date DATE NOT NULL,
  stripe_checkout_session_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 1499,
  status TEXT NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scheduled_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Purchasers can view their scheduled gifts"
  ON public.scheduled_gifts
  FOR SELECT
  USING (purchaser_user_id = auth.uid());

CREATE POLICY "Service role can manage scheduled gifts"
  ON public.scheduled_gifts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for efficient daily queries
CREATE INDEX idx_scheduled_gifts_send_date 
  ON public.scheduled_gifts(scheduled_send_date, status)
  WHERE status = 'scheduled';

-- Create index for purchaser lookups
CREATE INDEX idx_scheduled_gifts_purchaser 
  ON public.scheduled_gifts(purchaser_user_id)
  WHERE purchaser_user_id IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_gifts_updated_at
  BEFORE UPDATE ON public.scheduled_gifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add validation trigger for scheduled_send_date (must be in future)
CREATE OR REPLACE FUNCTION validate_scheduled_send_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.scheduled_send_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'scheduled_send_date must be today or in the future';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_scheduled_gifts_date
  BEFORE INSERT OR UPDATE ON public.scheduled_gifts
  FOR EACH ROW
  EXECUTE FUNCTION validate_scheduled_send_date();