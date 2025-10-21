-- Create care_updates table for public care update board
CREATE TABLE public.care_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL CHECK (char_length(update_text) <= 200),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_visible BOOLEAN DEFAULT true,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_care_updates_pet_id ON care_updates(pet_id);
CREATE INDEX idx_care_updates_reported_at ON care_updates(reported_at DESC);

-- Enable Row Level Security
ALTER TABLE public.care_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can post care updates for public pets
CREATE POLICY "Anyone can insert care updates for public pets"
ON care_updates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = care_updates.pet_id 
    AND pets.is_public = true
  )
);

-- Anyone can view visible care updates for public pets
CREATE POLICY "Anyone can view visible care updates"
ON care_updates FOR SELECT
USING (
  is_visible = true 
  AND EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = care_updates.pet_id 
    AND pets.is_public = true
  )
);

-- Pet owners can moderate their care updates
CREATE POLICY "Owners can moderate care updates"
ON care_updates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = care_updates.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Pet owners can delete care updates
CREATE POLICY "Owners can delete care updates"
ON care_updates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = care_updates.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Enable realtime for care_updates table
ALTER TABLE public.care_updates REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE care_updates;