-- Grant permanent legacy access to Sherisimmer7@gmail.com
UPDATE public.subscribers 
SET 
  status = 'active',
  subscribed = true,
  subscription_tier = 'Legacy',
  subscription_end = NULL, -- No expiration for legacy accounts
  pet_limit = 10, -- Generous pet limit for legacy users
  updated_at = NOW()
WHERE email = 'Sherisimmer7@gmail.com';

-- If no subscriber record exists, create one
INSERT INTO public.subscribers (
  email, 
  user_id, 
  status, 
  subscribed, 
  subscription_tier, 
  pet_limit,
  created_at,
  updated_at
)
SELECT 
  'Sherisimmer7@gmail.com',
  au.id,
  'active',
  true,
  'Legacy',
  10,
  NOW(),
  NOW()
FROM auth.users au 
WHERE au.email = 'Sherisimmer7@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.subscribers s 
  WHERE s.email = 'Sherisimmer7@gmail.com'
);