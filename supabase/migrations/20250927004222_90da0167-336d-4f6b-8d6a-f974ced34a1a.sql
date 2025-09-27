-- Allow pending checkout records without linked user
ALTER TABLE public.subscribers
ALTER COLUMN user_id DROP NOT NULL;