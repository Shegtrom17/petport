-- Create pet_guardians table for legacy guardian feature
CREATE TABLE IF NOT EXISTS public.pet_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  guardian_email TEXT NOT NULL,
  guardian_phone TEXT,
  authorization_level TEXT NOT NULL DEFAULT 'medical_only' CHECK (authorization_level IN ('medical_only', 'full_custody')),
  financial_limit INTEGER DEFAULT 0,
  special_instructions TEXT,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(pet_id)
);

-- Enable RLS
ALTER TABLE public.pet_guardians ENABLE ROW LEVEL SECURITY;

-- Pet owners can manage their pet guardians
CREATE POLICY "Users can manage their pet guardians"
ON public.pet_guardians
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_guardians.pet_id
    AND pets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_guardians.pet_id
    AND pets.user_id = auth.uid()
  )
);

-- Public access via token (for guardian access)
CREATE POLICY "Public can view guardians with valid token"
ON public.pet_guardians
FOR SELECT
TO anon, authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_pet_guardians_updated_at
BEFORE UPDATE ON public.pet_guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on access_token for fast lookups
CREATE INDEX idx_pet_guardians_access_token ON public.pet_guardians(access_token);
CREATE INDEX idx_pet_guardians_pet_id ON public.pet_guardians(pet_id);