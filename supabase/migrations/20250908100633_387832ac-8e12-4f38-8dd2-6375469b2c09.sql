-- Fix the duplicated contact data by properly parsing names and phone numbers
UPDATE pet_contacts 
SET 
  contact_name = CASE 
    WHEN contact_type = 'emergency' AND contact_name = 'Susan Hegstrom 651-332-4191' THEN 'Susan Hegstrom'
    WHEN contact_type = 'emergency' AND contact_name = 'Sue Hegstrom 651-332-4191' THEN 'Sue Hegstrom'
    WHEN contact_type = 'veterinary' AND contact_name = 'Valley View Vet ' THEN 'Valley View Vet'
    ELSE contact_name
  END,
  contact_phone = CASE 
    WHEN contact_type = 'emergency' AND contact_phone = 'Susan Hegstrom 651-332-4191' THEN '651-332-4191'
    WHEN contact_type = 'emergency' AND contact_phone = 'Sue Hegstrom 651-332-4191' THEN '651-332-4191'
    WHEN contact_type = 'veterinary' AND contact_phone = 'Valley View Vet (651)123-4567' THEN '(651)123-4567'
    ELSE contact_phone
  END
WHERE contact_name = contact_phone OR contact_name LIKE '%651-%' OR contact_phone LIKE '%Valley View Vet%';

-- Update contact types to be more specific for the second emergency contact
UPDATE pet_contacts 
SET contact_type = 'emergency_secondary'
WHERE contact_name = 'Sue Hegstrom' AND contact_type = 'emergency';