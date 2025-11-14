-- Create table to track referral link visits (before signup)
CREATE TABLE IF NOT EXISTS public.referral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  plan_type TEXT, -- 'yearly' or 'monthly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_referral_visits_code ON public.referral_visits(referral_code);
CREATE INDEX idx_referral_visits_ip ON public.referral_visits(ip_address);
CREATE INDEX idx_referral_visits_converted ON public.referral_visits(converted_user_id) WHERE converted_user_id IS NOT NULL;

-- RLS policies
ALTER TABLE public.referral_visits ENABLE ROW LEVEL SECURITY;

-- Only the system can write (via edge functions with service role)
-- Admins can read for debugging
CREATE POLICY "Admins can view referral visits"
  ON public.referral_visits
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add comment
COMMENT ON TABLE public.referral_visits IS 'Tracks referral link clicks before signup to recover attribution if cookies/localStorage fail. Only creates commissions for completed yearly subscriptions.';
