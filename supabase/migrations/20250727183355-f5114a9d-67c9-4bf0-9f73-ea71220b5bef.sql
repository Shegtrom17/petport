-- Create certifications table for pet professional certifications
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  issuer TEXT,
  certification_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their pet certifications" 
ON public.certifications 
FOR SELECT 
USING (( SELECT pets.user_id
   FROM pets
  WHERE (pets.id = certifications.pet_id)) = auth.uid());

CREATE POLICY "Users can insert their pet certifications" 
ON public.certifications 
FOR INSERT 
WITH CHECK (( SELECT pets.user_id
   FROM pets
  WHERE (pets.id = certifications.pet_id)) = auth.uid());

CREATE POLICY "Users can update their pet certifications" 
ON public.certifications 
FOR UPDATE 
USING (( SELECT pets.user_id
   FROM pets
  WHERE (pets.id = certifications.pet_id)) = auth.uid());

CREATE POLICY "Users can delete their pet certifications" 
ON public.certifications 
FOR DELETE 
USING (( SELECT pets.user_id
   FROM pets
  WHERE (pets.id = certifications.pet_id)) = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();