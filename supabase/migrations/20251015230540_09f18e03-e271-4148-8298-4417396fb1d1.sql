-- Backfill referral program for early subscriber: sherisimmer7@gmail.com
-- User subscribed before automatic referral trigger was implemented

DO $$
DECLARE
  target_user_id UUID := '7ad763c9-75e7-4a6a-81f9-9905ef10795b';
  existing_referral UUID;
BEGIN
  -- Check if referral already exists
  SELECT id INTO existing_referral 
  FROM public.referrals 
  WHERE referrer_user_id = target_user_id 
  LIMIT 1;
  
  -- Insert referral code only if doesn't exist
  IF existing_referral IS NULL THEN
    INSERT INTO public.referrals (
      referrer_user_id,
      referral_code
    )
    VALUES (
      target_user_id,
      public.generate_referral_code()
    );
    
    RAISE NOTICE 'Created referral code for user %', target_user_id;
  ELSE
    RAISE NOTICE 'Referral code already exists for user %', target_user_id;
  END IF;
  
  -- Insert payout record (user_id should be unique)
  INSERT INTO public.user_payouts (
    user_id,
    onboarding_status,
    yearly_earnings
  )
  VALUES (
    target_user_id,
    'not_started',
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RAISE NOTICE 'Referral program enabled for user %', target_user_id;
END $$;