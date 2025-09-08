-- Migrate existing contact data to the new pet_contacts table
INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  p.id as pet_id,
  CASE 
    WHEN c.emergency_contact IS NOT NULL THEN SPLIT_PART(c.emergency_contact, '(', 1)
    ELSE 'Emergency Contact'
  END as contact_name,
  c.emergency_contact as contact_phone,
  'emergency' as contact_type
FROM public.pets p
JOIN public.contacts c ON c.pet_id = p.id
WHERE c.emergency_contact IS NOT NULL AND c.emergency_contact != '';

INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  p.id as pet_id,
  CASE 
    WHEN c.second_emergency_contact IS NOT NULL THEN SPLIT_PART(c.second_emergency_contact, '(', 1)
    ELSE 'Secondary Emergency Contact'
  END as contact_name,
  c.second_emergency_contact as contact_phone,
  'emergency' as contact_type
FROM public.pets p
JOIN public.contacts c ON c.pet_id = p.id
WHERE c.second_emergency_contact IS NOT NULL AND c.second_emergency_contact != '';

INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  p.id as pet_id,
  CASE 
    WHEN c.vet_contact IS NOT NULL THEN SPLIT_PART(c.vet_contact, '(', 1)
    ELSE 'Veterinarian'
  END as contact_name,
  c.vet_contact as contact_phone,
  'veterinary' as contact_type
FROM public.pets p
JOIN public.contacts c ON c.pet_id = p.id
WHERE c.vet_contact IS NOT NULL AND c.vet_contact != '';

INSERT INTO public.pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  p.id as pet_id,
  CASE 
    WHEN c.pet_caretaker IS NOT NULL THEN SPLIT_PART(c.pet_caretaker, '(', 1)
    ELSE 'Pet Caretaker'
  END as contact_name,
  c.pet_caretaker as contact_phone,
  'caretaker' as contact_type
FROM public.pets p
JOIN public.contacts c ON c.pet_id = p.id
WHERE c.pet_caretaker IS NOT NULL AND c.pet_caretaker != '';