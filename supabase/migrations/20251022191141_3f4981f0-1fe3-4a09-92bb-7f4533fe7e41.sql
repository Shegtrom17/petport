-- Remove invalid monthly referral that was incorrectly credited
-- This referral should never have been created since monthly plans are not eligible
DELETE FROM referrals 
WHERE id = 'ca9d1d90-14ad-4472-8ef6-4843ce75b0ff'
  AND referred_plan_interval = 'month';

-- Add comment for future reference
COMMENT ON TABLE referrals IS 'Referrals table - Only yearly subscriptions are eligible for $2 commission. Monthly subscriptions should not create referral records.';