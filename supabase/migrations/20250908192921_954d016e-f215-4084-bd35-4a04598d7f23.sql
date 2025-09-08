-- Migrate legacy contact data to pet_contacts table
INSERT INTO pet_contacts (pet_id, contact_name, contact_phone, contact_type)
SELECT 
  c.pet_id,
  CASE 
    WHEN c.vet_contact IS NOT NULL AND c.vet_contact != '' THEN
      CASE 
        WHEN position('(' in c.vet_contact) > 0 THEN
          trim(substring(c.vet_contact from 1 for position('(' in c.vet_contact) - 1))
        ELSE c.vet_contact
      END
    ELSE ''
  END as contact_name,
  CASE 
    WHEN c.vet_contact IS NOT NULL AND c.vet_contact != '' THEN
      CASE 
        WHEN position('(' in c.vet_contact) > 0 AND position(')' in c.vet_contact) > 0 THEN
          trim(replace(replace(substring(c.vet_contact from position('(' in c.vet_contact) + 1 for position(')' in c.vet_contact) - position('(' in c.vet_contact) - 1), '(', ''), ')', ''))
        ELSE ''
      END
    ELSE ''
  END as contact_phone,
  'veterinary' as contact_type
FROM contacts c
WHERE c.vet_contact IS NOT NULL AND c.vet_contact != ''
  AND NOT EXISTS (SELECT 1 FROM pet_contacts pc WHERE pc.pet_id = c.pet_id AND pc.contact_type = 'veterinary')

UNION ALL

SELECT 
  c.pet_id,
  CASE 
    WHEN c.emergency_contact IS NOT NULL AND c.emergency_contact != '' THEN
      CASE 
        WHEN position(' ' in c.emergency_contact) > 0 THEN
          trim(substring(c.emergency_contact from 1 for position(' ' in reverse(c.emergency_contact))))
        ELSE c.emergency_contact
      END
    ELSE ''
  END as contact_name,
  CASE 
    WHEN c.emergency_contact IS NOT NULL AND c.emergency_contact != '' THEN
      trim(substring(c.emergency_contact from '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'))
    ELSE ''
  END as contact_phone,
  'emergency' as contact_type
FROM contacts c
WHERE c.emergency_contact IS NOT NULL AND c.emergency_contact != ''
  AND NOT EXISTS (SELECT 1 FROM pet_contacts pc WHERE pc.pet_id = c.pet_id AND pc.contact_type = 'emergency')

UNION ALL

SELECT 
  c.pet_id,
  CASE 
    WHEN c.second_emergency_contact IS NOT NULL AND c.second_emergency_contact != '' THEN
      CASE 
        WHEN position(' ' in c.second_emergency_contact) > 0 THEN
          trim(substring(c.second_emergency_contact from 1 for position(' ' in reverse(c.second_emergency_contact))))
        ELSE c.second_emergency_contact
      END
    ELSE ''
  END as contact_name,
  CASE 
    WHEN c.second_emergency_contact IS NOT NULL AND c.second_emergency_contact != '' THEN
      trim(substring(c.second_emergency_contact from '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'))
    ELSE ''
  END as contact_phone,
  'emergency_secondary' as contact_type
FROM contacts c
WHERE c.second_emergency_contact IS NOT NULL AND c.second_emergency_contact != ''
  AND NOT EXISTS (SELECT 1 FROM pet_contacts pc WHERE pc.pet_id = c.pet_id AND pc.contact_type = 'emergency_secondary')

UNION ALL

SELECT 
  c.pet_id,
  CASE 
    WHEN c.pet_caretaker IS NOT NULL AND c.pet_caretaker != '' THEN
      CASE 
        WHEN position(' ' in c.pet_caretaker) > 0 THEN
          trim(substring(c.pet_caretaker from 1 for position(' ' in reverse(c.pet_caretaker))))
        ELSE c.pet_caretaker
      END
    ELSE ''
  END as contact_name,
  CASE 
    WHEN c.pet_caretaker IS NOT NULL AND c.pet_caretaker != '' THEN
      trim(substring(c.pet_caretaker from '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]'))
    ELSE ''
  END as contact_phone,
  'caretaker' as contact_type
FROM contacts c
WHERE c.pet_caretaker IS NOT NULL AND c.pet_caretaker != ''
  AND NOT EXISTS (SELECT 1 FROM pet_contacts pc WHERE pc.pet_id = c.pet_id AND pc.contact_type = 'caretaker');