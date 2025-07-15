
-- Add public visibility field to pets table
ALTER TABLE public.pets ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add RLS policy for public read access to pets marked as public
CREATE POLICY "Allow public read access to public pets" 
ON public.pets 
FOR SELECT 
TO anon, authenticated
USING (is_public = true);

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add index for better performance on public pet queries
CREATE INDEX idx_pets_is_public ON public.pets(is_public) WHERE is_public = true;

-- Add updated_at trigger for pets table if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_pets_updated_at'
    ) THEN
        CREATE TRIGGER update_pets_updated_at
            BEFORE UPDATE ON public.pets
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
