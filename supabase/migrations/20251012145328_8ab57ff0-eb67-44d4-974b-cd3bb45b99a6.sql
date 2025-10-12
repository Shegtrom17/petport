-- Force update the care instructions upsert function to ensure caretaker_notes is included
DROP FUNCTION IF EXISTS public.handle_care_instructions_upsert(uuid, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.handle_care_instructions_upsert(
  _pet_id uuid,
  _feeding_schedule text DEFAULT NULL,
  _morning_routine text DEFAULT NULL,
  _evening_routine text DEFAULT NULL,
  _allergies text DEFAULT NULL,
  _behavioral_notes text DEFAULT NULL,
  _favorite_activities text DEFAULT NULL,
  _caretaker_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  care_id UUID;
BEGIN
  INSERT INTO public.care_instructions (
    pet_id, feeding_schedule, morning_routine, evening_routine, 
    allergies, behavioral_notes, favorite_activities, caretaker_notes
  )
  VALUES (
    _pet_id, _feeding_schedule, _morning_routine, _evening_routine,
    _allergies, _behavioral_notes, _favorite_activities, _caretaker_notes
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    feeding_schedule = COALESCE(_feeding_schedule, care_instructions.feeding_schedule),
    morning_routine = COALESCE(_morning_routine, care_instructions.morning_routine),
    evening_routine = COALESCE(_evening_routine, care_instructions.evening_routine),
    allergies = COALESCE(_allergies, care_instructions.allergies),
    behavioral_notes = COALESCE(_behavioral_notes, care_instructions.behavioral_notes),
    favorite_activities = COALESCE(_favorite_activities, care_instructions.favorite_activities),
    caretaker_notes = COALESCE(_caretaker_notes, care_instructions.caretaker_notes),
    updated_at = NOW()
  RETURNING id INTO care_id;
  
  RETURN care_id;
END;
$$;