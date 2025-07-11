
-- Add the petpass_id column to the pets table
ALTER TABLE public.pets ADD COLUMN petpass_id TEXT;

-- Create a function to generate unique Pet Pass IDs
CREATE OR REPLACE FUNCTION public.generate_petpass_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_id TEXT;
    year_part TEXT;
    uuid_part TEXT;
    counter INTEGER := 0;
BEGIN
    -- Get current year
    year_part := to_char(CURRENT_DATE, 'YYYY');
    
    -- Generate Pet Pass ID with collision handling
    LOOP
        -- Generate 8 characters from UUID (remove hyphens and take first 8)
        uuid_part := UPPER(REPLACE(gen_random_uuid()::TEXT, '-', ''));
        uuid_part := LEFT(uuid_part, 8);
        
        -- Format: PP-YYYY-XXXXXXXX
        new_id := 'PP-' || year_part || '-' || uuid_part;
        
        -- Check if this ID already exists (very unlikely but ensures uniqueness)
        IF NOT EXISTS (SELECT 1 FROM public.pets WHERE petpass_id = new_id) THEN
            EXIT;
        END IF;
        
        -- Safety counter to prevent infinite loops (extremely unlikely to be needed)
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique Pet Pass ID after 100 attempts';
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$;

-- Create trigger function to auto-generate petpass_id on insert
CREATE OR REPLACE FUNCTION public.trigger_generate_petpass_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate if petpass_id is not already set
    IF NEW.petpass_id IS NULL OR NEW.petpass_id = '' THEN
        NEW.petpass_id := public.generate_petpass_id();
    END IF;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER pets_generate_petpass_id
    BEFORE INSERT ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_generate_petpass_id();

-- Note: The pets table already has RLS enabled with user-based policies
-- The existing policy "Users can view their own pets" uses: (auth.uid() = user_id)
-- This is equivalent to your requested policy since auth.uid() extracts the 'sub' from the JWT
-- and user_id is your owner_id field. No additional RLS changes needed.
