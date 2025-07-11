
-- Update existing pets that don't have a petpass_id
UPDATE public.pets 
SET petpass_id = public.generate_petpass_id()
WHERE petpass_id IS NULL OR petpass_id = '';
