
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

-- Step 2: Ensure all existing pets have pet_pass_id values
UPDATE public.pets 
SET pet_pass_id = public.generate_petpass_id()
WHERE pet_pass_id IS NULL OR pet_pass_id = '';

-- Step 3: Add the unique constraint on pet_pass_id
DO $$
BEGIN
    -- Check if constraint already exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pets_pet_pass_id_key' 
        AND table_name = 'pets'
    ) THEN
        ALTER TABLE public.pets ADD CONSTRAINT pets_pet_pass_id_key UNIQUE (pet_pass_id);
    END IF;
END $$;

-- Step 4: Create a function to handle potential collisions during high-concurrency scenarios
CREATE OR REPLACE FUNCTION public.safe_generate_petpass_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_id TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    LOOP
        -- Generate a new Pet Pass ID
        new_id := public.generate_petpass_id();
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.pets WHERE pet_pass_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        -- Increment attempts and check if we've exceeded max attempts
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique Pet Pass ID after % attempts', max_attempts;
        END IF;
        
        -- Small delay to reduce collision probability
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$;

-- Step 5: Update the trigger to use the safer function
CREATE OR REPLACE FUNCTION public.trigger_generate_petpass_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if pet_pass_id is not already set
    IF NEW.pet_pass_id IS NULL OR NEW.pet_pass_id = '' THEN
        NEW.pet_pass_id := public.safe_generate_petpass_id();
    END IF;
    RETURN NEW;
END;
$$;
