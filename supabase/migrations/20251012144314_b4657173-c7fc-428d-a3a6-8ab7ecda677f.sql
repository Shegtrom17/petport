-- Add caretaker_notes field to care_instructions table
ALTER TABLE public.care_instructions 
ADD COLUMN caretaker_notes TEXT;