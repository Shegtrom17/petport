-- Phase 1: Referral & Affiliate System - Database Foundation
-- Creates user_payouts and referrals tables with auto-generated codes

-- =====================================================
-- 1. CREATE user_payouts TABLE
-- =====================================================
CREATE TABLE public.user_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  stripe_connect_id TEXT UNIQUE,
  onboarding_status TEXT NOT NULL DEFAULT 'not_started', 
  yearly_earnings INTEGER NOT NULL DEFAULT 0,
  last_earnings_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. CREATE referrals TABLE
-- =====================================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  commission_amount INTEGER NOT NULL DEFAULT 200,
  commission_status TEXT NOT NULL DEFAULT 'pending',
  referral_type TEXT DEFAULT 'casual',
  trial_completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. CREATE FUNCTION: Generate Referral Codes
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_code := 'REF-' || UPPER(
      substring(md5(random()::text || clock_timestamp()::text) from 1 for 6)
    );
    
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- =====================================================
-- 4. CREATE FUNCTION: Create User Referral
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_user_referral(_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_id UUID;
BEGIN
  INSERT INTO public.referrals (
    referrer_user_id,
    referral_code
  )
  VALUES (
    _user_id,
    public.generate_referral_code()
  )
  RETURNING id INTO referral_id;
  
  RETURN referral_id;
END;
$$;

-- =====================================================
-- 5. CREATE TRIGGER FUNCTION: Handle New User Referral
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referrals (
    referrer_user_id,
    referral_code
  )
  VALUES (
    NEW.id,
    public.generate_referral_code()
  );
  
  INSERT INTO public.user_payouts (
    user_id,
    onboarding_status,
    yearly_earnings
  )
  VALUES (
    NEW.id,
    'not_started',
    0
  );
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- 6. ATTACH TRIGGER: Auto-create on user signup
-- =====================================================
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_referral();

-- =====================================================
-- 7. ATTACH TRIGGERS: Auto-update timestamps
-- =====================================================
CREATE TRIGGER update_user_payouts_updated_at
  BEFORE UPDATE ON public.user_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. ENABLE RLS: user_payouts
-- =====================================================
ALTER TABLE public.user_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payout info"
  ON public.user_payouts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own payout info"
  ON public.user_payouts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 9. ENABLE RLS: referrals
-- =====================================================
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Public can view referrals by code"
  ON public.referrals
  FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- 10. CREATE INDEXES: Performance optimization
-- =====================================================
CREATE INDEX idx_referrals_referrer_user_id 
  ON public.referrals(referrer_user_id);

CREATE INDEX idx_referrals_referral_code 
  ON public.referrals(referral_code);

CREATE INDEX idx_referrals_commission_status 
  ON public.referrals(commission_status);

CREATE INDEX idx_user_payouts_user_id 
  ON public.user_payouts(user_id);

CREATE INDEX idx_user_payouts_stripe_connect_id 
  ON public.user_payouts(stripe_connect_id);