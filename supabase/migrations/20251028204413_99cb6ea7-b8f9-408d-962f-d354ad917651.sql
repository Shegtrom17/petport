-- Create gift_memberships table for Gift Membership feature
CREATE TABLE public.gift_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Gift details
  gift_code TEXT UNIQUE NOT NULL,
  purchaser_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchaser_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Stripe payment tracking
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 1499,
  
  -- Gift status
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  
  -- Renewal tracking
  reminder_60_sent_at TIMESTAMPTZ,
  reminder_30_sent_at TIMESTAMPTZ,
  reminder_7_sent_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  
  -- Personal touch
  gift_message TEXT,
  sender_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_gift_memberships_gift_code ON public.gift_memberships(gift_code);
CREATE INDEX idx_gift_memberships_recipient_email ON public.gift_memberships(recipient_email);
CREATE INDEX idx_gift_memberships_status ON public.gift_memberships(status);
CREATE INDEX idx_gift_memberships_expires_at ON public.gift_memberships(expires_at);
CREATE INDEX idx_gift_memberships_purchaser_user_id ON public.gift_memberships(purchaser_user_id);
CREATE INDEX idx_gift_memberships_recipient_user_id ON public.gift_memberships(recipient_user_id);

-- Enable Row Level Security
ALTER TABLE public.gift_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Purchasers can view gifts they bought
CREATE POLICY "Purchasers can view their gifts"
  ON public.gift_memberships 
  FOR SELECT
  USING (purchaser_user_id = auth.uid());

-- RLS Policy: Recipients can view their received gifts
CREATE POLICY "Recipients can view their gifts"
  ON public.gift_memberships 
  FOR SELECT
  USING (recipient_user_id = auth.uid() OR recipient_email = auth.email());

-- RLS Policy: Anyone can insert gifts (during purchase)
CREATE POLICY "Anyone can create gift records"
  ON public.gift_memberships 
  FOR INSERT
  WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_gift_memberships_updated_at
  BEFORE UPDATE ON public.gift_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();