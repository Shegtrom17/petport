
-- Step 1: Rename the pet_pass_id column to petport_id
ALTER TABLE public.pets RENAME COLUMN pet_pass_id TO petport_id;

-- Step 2: Rename the unique constraint
ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_pet_pass_id_key;
ALTER TABLE public.pets ADD CONSTRAINT pets_petport_id_key UNIQUE (petport_id);

-- Step 3: Update the generate function to use petport_id
CREATE OR REPLACE FUNCTION public.generate_petport_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_id TEXT;
    year_part TEXT;
    uuid_part TEXT;
    counter INTEGER := 0;
BEGIN
    -- Get current year
    year_part := to_char(CURRENT_DATE, 'YYYY');
    
    -- Generate Pet Port ID with collision handling
    LOOP
        -- Generate 8 characters from UUID (remove hyphens and take first 8)
        uuid_part := UPPER(REPLACE(gen_random_uuid()::TEXT, '-', ''));
        uuid_part := LEFT(uuid_part, 8);
        
        -- Format: PP-YYYY-XXXXXXXX (keeping PP prefix for Pet Port)
        new_id := 'PP-' || year_part || '-' || uuid_part;
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.pets WHERE petport_id = new_id) THEN
            EXIT;
        END IF;
        
        -- Safety counter to prevent infinite loops
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique Pet Port ID after 100 attempts';
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$;

-- Step 4: Update the safe generation function
CREATE OR REPLACE FUNCTION public.safe_generate_petport_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_id TEXT;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    LOOP
        -- Generate a new Pet Port ID
        new_id := public.generate_petport_id();
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.pets WHERE petport_id = new_id) THEN
            RETURN new_id;
        END IF;
        
        -- Increment attempts and check if we've exceeded max attempts
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique Pet Port ID after % attempts', max_attempts;
        END IF;
        
        -- Small delay to reduce collision probability
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$;

-- Step 5: Update the trigger function
CREATE OR REPLACE FUNCTION public.trigger_generate_petport_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only generate if petport_id is not already set
    IF NEW.petport_id IS NULL OR NEW.petport_id = '' THEN
        NEW.petport_id := public.safe_generate_petport_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Step 6: Drop the old trigger and create new one
DROP TRIGGER IF EXISTS pets_generate_petpass_id ON public.pets;
DROP TRIGGER IF EXISTS pets_pet_pass_id_trigger ON public.pets;

CREATE TRIGGER pets_generate_petport_id
    BEFORE INSERT ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_petport_id();

-- Step 7: Update all existing pets to have petport_id values if they don't
UPDATE public.pets 
SET petport_id = public.safe_generate_petport_id()
WHERE petport_id IS NULL OR petport_id = '';

-- Step 8: Drop old functions that are no longer needed
DROP FUNCTION IF EXISTS public.generate_petpass_id();
DROP FUNCTION IF EXISTS public.safe_generate_petpass_id();
DROP FUNCTION IF EXISTS public.trigger_generate_petpass_id();
DROP FUNCTION IF EXISTS public.generate_pet_pass_id();
