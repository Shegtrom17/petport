-- Add species-specific fields to pets table
ALTER TABLE public.pets 
ADD COLUMN height text,
ADD COLUMN registration_number text;