-- Add account_type to profiles for onboarding selection
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type text;

-- Optional: simple index to query by account_type (future analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
