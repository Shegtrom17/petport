-- Create lost_pet_data table for missing pet information
CREATE TABLE public.lost_pet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  is_missing BOOLEAN NOT NULL DEFAULT false,
  last_seen_location TEXT,
  last_seen_date TIMESTAMP WITH TIME ZONE,
  last_seen_time TEXT,
  distinctive_features TEXT,
  reward_amount TEXT,
  finder_instructions TEXT,
  contact_priority TEXT,
  emergency_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lost_pet_data ENABLE ROW LEVEL SECURITY;

-- Create policies for lost pet data
CREATE POLICY "Users can view their pet lost data" 
ON public.lost_pet_data 
FOR SELECT 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet lost data" 
ON public.lost_pet_data 
FOR INSERT 
WITH CHECK (( SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can update their pet lost data" 
ON public.lost_pet_data 
FOR UPDATE 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet lost data" 
ON public.lost_pet_data 
FOR DELETE 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

-- Allow public read access to lost pet data when pet is public and marked as missing
CREATE POLICY "Allow public read access to missing pets" 
ON public.lost_pet_data 
FOR SELECT 
USING (
  is_missing = true 
  AND EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = lost_pet_data.pet_id 
    AND pets.is_public = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lost_pet_data_updated_at
BEFORE UPDATE ON public.lost_pet_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle lost pet data upsert
CREATE OR REPLACE FUNCTION public.handle_lost_pet_data_upsert(
  _pet_id UUID,
  _is_missing BOOLEAN DEFAULT false,
  _last_seen_location TEXT DEFAULT NULL,
  _last_seen_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _last_seen_time TEXT DEFAULT NULL,
  _distinctive_features TEXT DEFAULT NULL,
  _reward_amount TEXT DEFAULT NULL,
  _finder_instructions TEXT DEFAULT NULL,
  _contact_priority TEXT DEFAULT NULL,
  _emergency_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lost_pet_id UUID;
BEGIN
  INSERT INTO public.lost_pet_data (
    pet_id, is_missing, last_seen_location, last_seen_date, last_seen_time,
    distinctive_features, reward_amount, finder_instructions, contact_priority, emergency_notes
  )
  VALUES (
    _pet_id, _is_missing, _last_seen_location, _last_seen_date, _last_seen_time,
    _distinctive_features, _reward_amount, _finder_instructions, _contact_priority, _emergency_notes
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    is_missing = COALESCE(_is_missing, lost_pet_data.is_missing),
    last_seen_location = COALESCE(_last_seen_location, lost_pet_data.last_seen_location),
    last_seen_date = COALESCE(_last_seen_date, lost_pet_data.last_seen_date),
    last_seen_time = COALESCE(_last_seen_time, lost_pet_data.last_seen_time),
    distinctive_features = COALESCE(_distinctive_features, lost_pet_data.distinctive_features),
    reward_amount = COALESCE(_reward_amount, lost_pet_data.reward_amount),
    finder_instructions = COALESCE(_finder_instructions, lost_pet_data.finder_instructions),
    contact_priority = COALESCE(_contact_priority, lost_pet_data.contact_priority),
    emergency_notes = COALESCE(_emergency_notes, lost_pet_data.emergency_notes),
    updated_at = NOW()
  RETURNING id INTO lost_pet_id;
  
  RETURN lost_pet_id;
END;
$$;

-- Create unique constraint on pet_id to ensure one lost pet record per pet
ALTER TABLE public.lost_pet_data ADD CONSTRAINT lost_pet_data_pet_id_unique UNIQUE (pet_id);