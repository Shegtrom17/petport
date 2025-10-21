-- Create pet_sightings table for community sighting reports
CREATE TABLE IF NOT EXISTS public.pet_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  sighting_text TEXT NOT NULL CHECK (char_length(sighting_text) <= 200),
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_sightings ENABLE ROW LEVEL SECURITY;

-- Anyone can insert sightings for missing pets
CREATE POLICY "Anyone can report sightings for missing pets"
ON public.pet_sightings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lost_pet_data
    WHERE pet_id = pet_sightings.pet_id AND is_missing = true
  )
);

-- Anyone can view visible sightings for missing pets
CREATE POLICY "Anyone can view visible sightings for missing pets"
ON public.pet_sightings
FOR SELECT
USING (
  is_visible = true AND
  EXISTS (
    SELECT 1 FROM public.lost_pet_data
    WHERE pet_id = pet_sightings.pet_id AND is_missing = true
  )
);

-- Pet owners can view all sightings for their pets
CREATE POLICY "Pet owners can view all sightings"
ON public.pet_sightings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_sightings.pet_id AND pets.user_id = auth.uid()
  )
);

-- Pet owners can update visibility of sightings (moderation)
CREATE POLICY "Pet owners can moderate sightings"
ON public.pet_sightings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_sightings.pet_id AND pets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_sightings.pet_id AND pets.user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pet_sightings_pet_id ON public.pet_sightings(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_sightings_reported_at ON public.pet_sightings(reported_at DESC);