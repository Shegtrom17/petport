
-- Create care_instructions table to store feeding schedules, routines, etc.
CREATE TABLE public.care_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  feeding_schedule TEXT,
  morning_routine TEXT,
  evening_routine TEXT,
  allergies TEXT,
  behavioral_notes TEXT,
  favorite_activities TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT care_instructions_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT care_instructions_pet_id_unique UNIQUE (pet_id)
);

-- Enable RLS on care_instructions
ALTER TABLE public.care_instructions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for care_instructions
CREATE POLICY "Users can view their pet care instructions" 
  ON public.care_instructions 
  FOR SELECT 
  USING ((SELECT pets.user_id FROM pets WHERE pets.id = care_instructions.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet care instructions" 
  ON public.care_instructions 
  FOR INSERT 
  WITH CHECK ((SELECT pets.user_id FROM pets WHERE pets.id = care_instructions.pet_id) = auth.uid());

CREATE POLICY "Users can update their pet care instructions" 
  ON public.care_instructions 
  FOR UPDATE 
  USING ((SELECT pets.user_id FROM pets WHERE pets.id = care_instructions.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet care instructions" 
  ON public.care_instructions 
  FOR DELETE 
  USING ((SELECT pets.user_id FROM pets WHERE pets.id = care_instructions.pet_id) = auth.uid());

-- Create function to handle care instructions upsert
CREATE OR REPLACE FUNCTION public.handle_care_instructions_upsert(
  _pet_id UUID,
  _feeding_schedule TEXT DEFAULT NULL,
  _morning_routine TEXT DEFAULT NULL,
  _evening_routine TEXT DEFAULT NULL,
  _allergies TEXT DEFAULT NULL,
  _behavioral_notes TEXT DEFAULT NULL,
  _favorite_activities TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  care_id UUID;
BEGIN
  INSERT INTO public.care_instructions (
    pet_id, feeding_schedule, morning_routine, evening_routine, 
    allergies, behavioral_notes, favorite_activities
  )
  VALUES (
    _pet_id, _feeding_schedule, _morning_routine, _evening_routine,
    _allergies, _behavioral_notes, _favorite_activities
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    feeding_schedule = COALESCE(_feeding_schedule, care_instructions.feeding_schedule),
    morning_routine = COALESCE(_morning_routine, care_instructions.morning_routine),
    evening_routine = COALESCE(_evening_routine, care_instructions.evening_routine),
    allergies = COALESCE(_allergies, care_instructions.allergies),
    behavioral_notes = COALESCE(_behavioral_notes, care_instructions.behavioral_notes),
    favorite_activities = COALESCE(_favorite_activities, care_instructions.favorite_activities),
    updated_at = NOW()
  RETURNING id INTO care_id;
  
  RETURN care_id;
END;
$$;
