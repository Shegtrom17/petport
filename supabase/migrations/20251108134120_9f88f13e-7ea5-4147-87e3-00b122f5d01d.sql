-- Create service_provider_notes table
CREATE TABLE public.service_provider_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_email TEXT,
  provider_phone TEXT,
  provider_type TEXT NOT NULL, -- veterinarian, farrier, groomer, trainer, behaviorist, chiropractor, dentist, other
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL, -- e.g., "Trim & shoe", "Behavioral assessment"
  observations TEXT, -- Longer text field for detailed notes
  recommendations TEXT, -- Recommendations for owner
  next_appointment_suggestion TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_provider_notes ENABLE ROW LEVEL SECURITY;

-- Public can insert notes for public pets (via share link)
CREATE POLICY "Anyone can insert notes for public pets"
ON public.service_provider_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = service_provider_notes.pet_id
    AND pets.is_public = true
  )
);

-- Public can view visible notes for public pets
CREATE POLICY "Anyone can view visible notes for public pets"
ON public.service_provider_notes
FOR SELECT
USING (
  is_visible = true
  AND EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = service_provider_notes.pet_id
    AND pets.is_public = true
  )
);

-- Owners can view all their pet's notes
CREATE POLICY "Owners can view all their pet notes"
ON public.service_provider_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = service_provider_notes.pet_id
    AND pets.user_id = auth.uid()
  )
);

-- Owners can moderate (update/delete) notes
CREATE POLICY "Owners can moderate notes"
ON public.service_provider_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = service_provider_notes.pet_id
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete notes"
ON public.service_provider_notes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = service_provider_notes.pet_id
    AND pets.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_service_provider_notes_pet_id ON public.service_provider_notes(pet_id);
CREATE INDEX idx_service_provider_notes_created_at ON public.service_provider_notes(created_at DESC);
CREATE INDEX idx_service_provider_notes_service_date ON public.service_provider_notes(service_date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_service_provider_notes_updated_at
BEFORE UPDATE ON public.service_provider_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();