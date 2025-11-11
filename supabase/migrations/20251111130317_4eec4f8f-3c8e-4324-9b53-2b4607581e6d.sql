-- Reactivate subscriber for shegstrom17@gmail.com to immediately restore access
UPDATE public.subscribers
SET 
  status = 'active',
  subscribed = true,
  reactivated_at = NOW(),
  grace_period_end = NULL,
  updated_at = NOW()
WHERE user_id = 'c36c0c6d-702a-4da0-a1cc-5cce848e4d20';