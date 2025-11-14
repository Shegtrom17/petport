-- Manual Referral Linking for sue@petport.app (suehegstromx39@gmail.com)
-- Run this in your Supabase SQL Editor to manually link the referral

BEGIN;

-- 1. Update the referral visit to mark it as converted
UPDATE referral_visits
SET 
  converted_user_id = '6e6e6ec6-53f2-473a-ad9b-92fcfef34744',
  converted_at = '2025-11-14 18:08:45.749203+00',
  plan_type = 'yearly'
WHERE id = '83625ed6-f890-492d-a66e-0eb6545005f4';

-- 2. Link the referral record to the new user
UPDATE referrals
SET 
  referred_user_id = '6e6e6ec6-53f2-473a-ad9b-92fcfef34744',
  referred_plan_interval = 'year',
  commission_status = 'approved',
  approved_at = NOW(),
  trial_completed_at = '2025-11-21 18:08:45.749203+00', -- 7 days after signup
  updated_at = NOW()
WHERE referral_code = 'REF-499E78'
  AND referred_user_id IS NULL;

COMMIT;

-- Verify the changes
SELECT 
  'Referral Visit' as record_type,
  rv.id,
  rv.referral_code,
  rv.converted_at,
  p.email as converted_user_email
FROM referral_visits rv
LEFT JOIN profiles p ON rv.converted_user_id = p.id
WHERE rv.id = '83625ed6-f890-492d-a66e-0eb6545005f4'

UNION ALL

SELECT 
  'Referral Record' as record_type,
  r.id,
  r.referral_code,
  r.approved_at::text,
  p.email as referred_user_email
FROM referrals r
LEFT JOIN profiles p ON r.referred_user_id = p.id
WHERE r.referral_code = 'REF-499E78';
