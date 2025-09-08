-- Migration to transfer existing contact data from contacts table to pet_contacts table
-- This preserves all existing contact information that was "lost" during the system transition

-- Insert emergency contacts
INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  pet_id,
  TRIM(SPLIT_PART(emergency_contact, ' ', 1) || ' ' || SPLIT_PART(emergency_contact, ' ', 2)) as contact_name,
  TRIM(REGEXP_REPLACE(emergency_contact, '^[^0-9]*([0-9\-\(\)\s]+).*$', '\1')) as contact_phone,
  'emergency' as contact_type
FROM public.contacts 
WHERE emergency_contact IS NOT NULL 
  AND emergency_contact != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.pet_contacts pc 
    WHERE pc.pet_id = contacts.pet_id 
    AND pc.contact_type = 'emergency'
  );

-- Insert secondary emergency contacts
INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  pet_id,
  TRIM(SPLIT_PART(second_emergency_contact, ' ', 1) || ' ' || SPLIT_PART(second_emergency_contact, ' ', 2)) as contact_name,
  TRIM(REGEXP_REPLACE(second_emergency_contact, '^[^0-9]*([0-9\-\(\)\s]+).*$', '\1')) as contact_phone,
  'emergency_secondary' as contact_type
FROM public.contacts 
WHERE second_emergency_contact IS NOT NULL 
  AND second_emergency_contact != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.pet_contacts pc 
    WHERE pc.pet_id = contacts.pet_id 
    AND pc.contact_type = 'emergency_secondary'
  );

-- Insert veterinary contacts
INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  pet_id,
  TRIM(SPLIT_PART(vet_contact, ' ', 1) || ' ' || SPLIT_PART(vet_contact, ' ', 2) || ' ' || SPLIT_PART(vet_contact, ' ', 3)) as contact_name,
  TRIM(REGEXP_REPLACE(vet_contact, '^[^0-9]*([0-9\-\(\)\s]+).*$', '\1')) as contact_phone,
  'veterinary' as contact_type
FROM public.contacts 
WHERE vet_contact IS NOT NULL 
  AND vet_contact != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.pet_contacts pc 
    WHERE pc.pet_id = contacts.pet_id 
    AND pc.contact_type = 'veterinary'
  );

-- Insert pet caretaker contacts (this will restore Amy Colby!)
INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  pet_id,
  TRIM(SPLIT_PART(pet_caretaker, ' ', 1) || ' ' || SPLIT_PART(pet_caretaker, ' ', 2)) as contact_name,
  TRIM(REGEXP_REPLACE(pet_caretaker, '^[^0-9]*([0-9\-\(\)\s]+).*$', '\1')) as contact_phone,
  'caretaker' as contact_type
FROM public.contacts 
WHERE pet_caretaker IS NOT NULL 
  AND pet_caretaker != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.pet_contacts pc 
    WHERE pc.pet_id = contacts.pet_id 
    AND pc.contact_type = 'caretaker'
  );