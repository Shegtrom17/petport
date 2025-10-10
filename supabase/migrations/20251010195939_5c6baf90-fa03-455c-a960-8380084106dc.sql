-- Phase 1: Email Campaign System Database Foundation

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table for admin access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Subscriber tags for segmentation
CREATE TABLE public.subscriber_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users to tags
CREATE TABLE public.user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES subscriber_tags(id) ON DELETE CASCADE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tag_id)
);

-- Email preferences and unsubscribe tracking
CREATE TABLE public.email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount codes (for referral campaigns)
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  campaign_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Coupon redemption tracking
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  campaign_id UUID
);

-- Campaign management
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  postmark_template_id TEXT,
  postmark_template_alias TEXT,
  target_segment TEXT,
  discount_code_id UUID REFERENCES discount_codes(id),
  created_by UUID REFERENCES auth.users(id),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sent', 'canceled')),
  total_recipients INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  unsubscribes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tags for segmentation
INSERT INTO public.subscriber_tags (tag_name, description, color) VALUES
  ('rescue_organization', 'Animal shelters and rescue organizations', '#10b981'),
  ('individual_owner', 'Individual pet owners', '#3b82f6'),
  ('professional', 'Trainers, groomers, vets', '#8b5cf6'),
  ('referred_friend', 'Signed up via referral link', '#f59e0b'),
  ('beta_tester', 'Early adopters and beta testers', '#ef4444'),
  ('active_subscriber', 'Currently has active subscription', '#06b6d4'),
  ('trial_user', 'In first 30 days', '#84cc16'),
  ('uses_lost_pet', 'Created missing pet alerts', '#ec4899'),
  ('uses_travel_map', 'Has travel pins on map', '#6366f1'),
  ('has_resume', 'Uses professional resume feature', '#14b8a6');

-- Security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles: Only admins can manage roles
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Campaigns: Admin-only access
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Discount codes: Admin-only access
CREATE POLICY "Admins can manage discount codes"
  ON public.discount_codes FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Subscriber tags: Admins can manage
CREATE POLICY "Admins can manage subscriber tags"
  ON public.subscriber_tags FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- User tags: Admins can manage
CREATE POLICY "Admins can manage user tags"
  ON public.user_tags FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Email preferences: Users can manage their own, allow unauthenticated unsubscribes
CREATE POLICY "Users can manage their email preferences"
  ON public.email_preferences FOR ALL
  USING (user_id = auth.uid() OR auth.uid() IS NULL)
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

-- Coupon redemptions: Users can view their own, admins can view all
CREATE POLICY "Users can view their own redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Trigger to auto-apply tags based on user behavior
CREATE OR REPLACE FUNCTION public.auto_apply_user_tags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_tag_id UUID;
BEGIN
  -- Auto-tag new users as trial_user
  SELECT id INTO trial_tag_id FROM subscriber_tags WHERE tag_name = 'trial_user';
  
  IF trial_tag_id IS NOT NULL THEN
    INSERT INTO user_tags (user_id, tag_id)
    VALUES (NEW.id, trial_tag_id)
    ON CONFLICT (user_id, tag_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_apply_tags
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_apply_user_tags();