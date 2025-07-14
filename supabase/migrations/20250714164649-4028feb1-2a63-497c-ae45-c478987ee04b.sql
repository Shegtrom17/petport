
-- Create the map_pins table for storing map pin locations
CREATE TABLE public.map_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.map_pins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for map_pins
CREATE POLICY "Users can view their pet map pins" 
  ON public.map_pins 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = map_pins.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their pet map pins" 
  ON public.map_pins 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = map_pins.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pet map pins" 
  ON public.map_pins 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = map_pins.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pet map pins" 
  ON public.map_pins 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = map_pins.pet_id 
      AND pets.user_id = auth.uid()
    )
  );
