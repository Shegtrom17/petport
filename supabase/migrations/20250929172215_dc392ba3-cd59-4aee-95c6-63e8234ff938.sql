-- Grant permanent legacy access using case-insensitive email matching
UPDATE public.subscribers 
SET 
  status = 'active',
  subscribed = true,
  subscription_tier = 'Legacy',
  subscription_end = NULL,
  pet_limit = 10,
  updated_at = NOW()
WHERE lower(email) = lower('sherisimmer7@gmail.com');