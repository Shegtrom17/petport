-- Add organization and adoption fields to pets table
ALTER TABLE public.pets 
ADD COLUMN organization_name text,
ADD COLUMN organization_email text,
ADD COLUMN organization_phone text,
ADD COLUMN organization_website text,
ADD COLUMN custom_logo_url text,
ADD COLUMN adoption_status text DEFAULT 'not_available',
ADD COLUMN adoption_instructions text;

-- Add a check constraint for adoption_status values
ALTER TABLE public.pets 
ADD CONSTRAINT pets_adoption_status_check 
CHECK (adoption_status IN ('available', 'pending', 'adopted', 'not_available'));