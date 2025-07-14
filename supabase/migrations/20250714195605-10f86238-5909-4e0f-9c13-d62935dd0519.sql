
-- Step 1: Database Cleanup and Consolidation

-- First, copy any existing petpass_id values to pet_pass_id if they're different
UPDATE public.pets 
SET pet_pass_id = petpass_id 
WHERE pet_pass_id IS NULL AND petpass_id IS NOT NULL;

-- Drop the old trigger and function that uses sequential numbering
DROP TRIGGER IF EXISTS pets_pet_pass_id_trigger ON public.pets;
DROP FUNCTION IF EXISTS public.generate_pet_pass_id();

-- Remove the duplicate petpass_id column
ALTER TABLE public.pets DROP COLUMN IF EXISTS petpass_id;

-- Update the existing trigger function to populate pet_pass_id instead of petpass_id
CREATE OR REPLACE FUNCTION public.trigger_generate_petpass_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if pet_pass_id is not already set
    IF NEW.pet_pass_id IS NULL OR NEW.pet_pass_id = '' THEN
        NEW.pet_pass_id := public.generate_petpass_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate the trigger to use the updated function
CREATE TRIGGER pets_generate_petpass_id
    BEFORE INSERT ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_petpass_id();

-- Ensure the unique constraint exists on pet_pass_id
ALTER TABLE public.pets ADD CONSTRAINT pets_pet_pass_id_key UNIQUE (pet_pass_id);
