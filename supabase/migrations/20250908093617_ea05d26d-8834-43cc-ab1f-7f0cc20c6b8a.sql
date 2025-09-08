-- Create a new simplified contacts table for pets
CREATE TABLE public.pet_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_type TEXT NOT NULL DEFAULT 'general', -- general, emergency, veterinary, caretaker
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for pet_contacts
CREATE POLICY "Users can view their pet contacts" 
ON public.pet_contacts 
FOR SELECT 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = pet_contacts.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet contacts" 
ON public.pet_contacts 
FOR INSERT 
WITH CHECK (( SELECT pets.user_id FROM pets WHERE pets.id = pet_contacts.pet_id) = auth.uid());

CREATE POLICY "Users can update their pet contacts" 
ON public.pet_contacts 
FOR UPDATE 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = pet_contacts.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet contacts" 
ON public.pet_contacts 
FOR DELETE 
USING (( SELECT pets.user_id FROM pets WHERE pets.id = pet_contacts.pet_id) = auth.uid());

CREATE POLICY "Public access to public pet contacts" 
ON public.pet_contacts 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM pets WHERE (pets.id = pet_contacts.pet_id) AND (pets.is_public = true)));

CREATE POLICY "Public access to missing pet contacts" 
ON public.pet_contacts 
FOR SELECT 
USING (is_pet_missing(pet_id));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pet_contacts_updated_at
BEFORE UPDATE ON public.pet_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();