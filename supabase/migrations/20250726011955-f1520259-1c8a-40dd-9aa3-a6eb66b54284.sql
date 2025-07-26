-- Create lost_pet_data table for missing pet information
CREATE TABLE public.lost_pet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL UNIQUE,
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

-- Create policies for user access
CREATE POLICY "Users can view their pet lost data" 
ON public.lost_pet_data 
FOR SELECT 
USING ((SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet lost data" 
ON public.lost_pet_data 
FOR INSERT 
WITH CHECK ((SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can update their pet lost data" 
ON public.lost_pet_data 
FOR UPDATE 
USING ((SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet lost data" 
ON public.lost_pet_data 
FOR DELETE 
USING ((SELECT pets.user_id FROM pets WHERE pets.id = lost_pet_data.pet_id) = auth.uid());

-- Allow public read access to missing pets for sharing
CREATE POLICY "Allow public read access to missing pets" 
ON public.lost_pet_data 
FOR SELECT 
USING (is_missing = true AND EXISTS (
  SELECT 1 FROM pets 
  WHERE pets.id = lost_pet_data.pet_id 
  AND pets.is_public = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lost_pet_data_updated_at
BEFORE UPDATE ON public.lost_pet_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();