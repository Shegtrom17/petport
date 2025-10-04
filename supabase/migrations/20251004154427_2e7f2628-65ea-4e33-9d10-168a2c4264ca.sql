-- Add plan_interval to subscribers table to track monthly vs yearly subscriptions
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS plan_interval text DEFAULT 'year' CHECK (plan_interval IN ('month', 'year'));

-- Add plan_interval to referrals table to track which plan type triggered the referral
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS referred_plan_interval text CHECK (referred_plan_interval IN ('month', 'year'));

-- Add comment for documentation
COMMENT ON COLUMN public.subscribers.plan_interval IS 'Tracks whether the subscription is monthly or yearly. Only yearly subscriptions are eligible for referral commissions.';
COMMENT ON COLUMN public.referrals.referred_plan_interval IS 'Tracks the plan interval of the referred user. Only yearly subscriptions earn referral commissions.';