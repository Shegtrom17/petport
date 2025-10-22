-- Manually link referral for susanloren.coach@gmail.com
UPDATE referrals 
SET 
  referred_user_id = 'd4a5a249-18a7-44e0-b726-bfbbce055e6c',
  referred_plan_interval = 'month',
  trial_completed_at = '2025-10-29 17:43:09+00',
  updated_at = now()
WHERE id = 'ca9d1d90-14ad-4472-8ef6-4843ce75b0ff';