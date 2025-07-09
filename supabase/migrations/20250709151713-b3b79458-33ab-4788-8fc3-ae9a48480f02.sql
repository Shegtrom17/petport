
-- Add state and county columns to the pets table
ALTER TABLE public.pets 
ADD COLUMN state TEXT,
ADD COLUMN county TEXT;
