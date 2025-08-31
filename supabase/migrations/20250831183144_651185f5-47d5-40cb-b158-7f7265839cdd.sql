-- Enable pgcrypto extension for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add created_at column to subscribers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'created_at') THEN
        ALTER TABLE public.subscribers ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- Create subscription_status ENUM if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'grace', 'suspended', 'canceled');
    END IF;
END $$;

-- Clean up duplicate subscribers by user_id first, then by email
WITH duplicate_user_ids AS (
    SELECT user_id, 
           array_agg(id ORDER BY created_at DESC) as ids
    FROM public.subscribers 
    WHERE user_id IS NOT NULL
    GROUP BY user_id 
    HAVING count(*) > 1
),
duplicate_emails AS (
    SELECT LOWER(email) as email_lower, 
           array_agg(id ORDER BY created_at DESC) as ids
    FROM public.subscribers 
    WHERE user_id IS NULL AND created_at IS NOT NULL
    GROUP BY LOWER(email) 
    HAVING count(*) > 1
)
DELETE FROM public.subscribers 
WHERE id IN (
    SELECT unnest(ids[2:]) FROM duplicate_user_ids
    UNION
    SELECT unnest(ids[2:]) FROM duplicate_emails
);

-- Backfill NULL user_ids from auth.users by matching email
UPDATE public.subscribers 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE subscribers.user_id IS NULL 
  AND subscribers.email = auth_users.email;

-- Add new subscription columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'status') THEN
        ALTER TABLE public.subscribers ADD COLUMN status subscription_status DEFAULT 'suspended';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'payment_failed_at') THEN
        ALTER TABLE public.subscribers ADD COLUMN payment_failed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'grace_period_end') THEN
        ALTER TABLE public.subscribers ADD COLUMN grace_period_end TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'suspended_at') THEN
        ALTER TABLE public.subscribers ADD COLUMN suspended_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'canceled_at') THEN
        ALTER TABLE public.subscribers ADD COLUMN canceled_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscribers' AND column_name = 'reactivated_at') THEN
        ALTER TABLE public.subscribers ADD COLUMN reactivated_at TIMESTAMPTZ;
    END IF;
END $$;

-- Backfill status from subscribed column
UPDATE public.subscribers 
SET status = CASE 
    WHEN subscribed = true THEN 'active'::subscription_status
    ELSE 'suspended'::subscription_status
END
WHERE status = 'suspended'; -- Only update rows that haven't been explicitly set

-- Set status and user_id as NOT NULL after backfill
ALTER TABLE public.subscribers ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscribers_user_id_key'
    ) THEN
        ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_grace_period_end ON public.subscribers(grace_period_end);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- Create helper function to check if user has active subscription (including grace period)
CREATE OR REPLACE FUNCTION public.is_user_subscription_active(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE user_id = user_uuid 
    AND (
      status = 'active' 
      OR (status = 'grace' AND (grace_period_end IS NULL OR grace_period_end > now()))
    )
  );
$$;

-- Create webhook_events table for idempotency if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text UNIQUE NOT NULL,
    event_type text NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_events table for security
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- No explicit policies for webhook_events - service role bypasses RLS
-- This restricts access to service role only

-- Update RLS policies for subscribers table
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid());

-- No INSERT/UPDATE policies for users - service role only can modify subscriptions

-- Enable RLS on sensitive tables and add status-aware policies
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Update pets policies to enforce subscription status
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

CREATE POLICY "Active users can view their own pets" ON public.pets
FOR SELECT USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "Active users can insert their own pets" ON public.pets
FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "Active users can update their own pets" ON public.pets
FOR UPDATE USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "Active users can delete their own pets" ON public.pets
FOR DELETE USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

-- Update pet_photos policies
DROP POLICY IF EXISTS "Users can view their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can insert their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can update their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can delete their pet photos" ON public.pet_photos;

CREATE POLICY "Active users can view their pet photos" ON public.pet_photos
FOR SELECT USING (
    (SELECT user_id FROM pets WHERE pets.id = pet_photos.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can insert their pet photos" ON public.pet_photos
FOR INSERT WITH CHECK (
    (SELECT user_id FROM pets WHERE pets.id = pet_photos.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can update their pet photos" ON public.pet_photos
FOR UPDATE USING (
    (SELECT user_id FROM pets WHERE pets.id = pet_photos.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can delete their pet photos" ON public.pet_photos
FOR DELETE USING (
    (SELECT user_id FROM pets WHERE pets.id = pet_photos.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

-- Update medical policies
DROP POLICY IF EXISTS "Users can view their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Users can insert their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Users can update their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Users can delete their pet medical data" ON public.medical;

CREATE POLICY "Active users can view their pet medical data" ON public.medical
FOR SELECT USING (
    (SELECT user_id FROM pets WHERE pets.id = medical.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can insert their pet medical data" ON public.medical
FOR INSERT WITH CHECK (
    (SELECT user_id FROM pets WHERE pets.id = medical.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can update their pet medical data" ON public.medical
FOR UPDATE USING (
    (SELECT user_id FROM pets WHERE pets.id = medical.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can delete their pet medical data" ON public.medical
FOR DELETE USING (
    (SELECT user_id FROM pets WHERE pets.id = medical.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

-- Update reviews policies
DROP POLICY IF EXISTS "Users can view their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their pet reviews" ON public.reviews;

CREATE POLICY "Active users can view their pet reviews" ON public.reviews
FOR SELECT USING (
    (SELECT user_id FROM pets WHERE pets.id = reviews.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can insert their pet reviews" ON public.reviews
FOR INSERT WITH CHECK (
    (SELECT user_id FROM pets WHERE pets.id = reviews.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can update their pet reviews" ON public.reviews
FOR UPDATE USING (
    (SELECT user_id FROM pets WHERE pets.id = reviews.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can delete their pet reviews" ON public.reviews
FOR DELETE USING (
    (SELECT user_id FROM pets WHERE pets.id = reviews.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

-- Update achievements policies
DROP POLICY IF EXISTS "Users can view their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can update their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can delete their pet achievements" ON public.achievements;

CREATE POLICY "Active users can view their pet achievements" ON public.achievements
FOR SELECT USING (
    (SELECT user_id FROM pets WHERE pets.id = achievements.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can insert their pet achievements" ON public.achievements
FOR INSERT WITH CHECK (
    (SELECT user_id FROM pets WHERE pets.id = achievements.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can update their pet achievements" ON public.achievements
FOR UPDATE USING (
    (SELECT user_id FROM pets WHERE pets.id = achievements.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can delete their pet achievements" ON public.achievements
FOR DELETE USING (
    (SELECT user_id FROM pets WHERE pets.id = achievements.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

-- Update documents policies
DROP POLICY IF EXISTS "Users can view their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their pet documents" ON public.documents;

CREATE POLICY "Active users can view their pet documents" ON public.documents
FOR SELECT USING (
    (SELECT user_id FROM pets WHERE pets.id = documents.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can insert their pet documents" ON public.documents
FOR INSERT WITH CHECK (
    (SELECT user_id FROM pets WHERE pets.id = documents.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can update their pet documents" ON public.documents
FOR UPDATE USING (
    (SELECT user_id FROM pets WHERE pets.id = documents.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);

CREATE POLICY "Active users can delete their pet documents" ON public.documents
FOR DELETE USING (
    (SELECT user_id FROM pets WHERE pets.id = documents.pet_id) = auth.uid() 
    AND public.is_user_subscription_active(auth.uid())
);