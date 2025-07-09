
-- Phase 1: Database Integrity - Add unique constraints and clean up duplicates

-- First, clean up existing duplicate records by keeping only the most recent ones
WITH ranked_contacts AS (
  SELECT id, pet_id, ROW_NUMBER() OVER (PARTITION BY pet_id ORDER BY updated_at DESC) as rn
  FROM contacts
),
contacts_to_delete AS (
  SELECT id FROM ranked_contacts WHERE rn > 1
)
DELETE FROM contacts WHERE id IN (SELECT id FROM contacts_to_delete);

WITH ranked_medical AS (
  SELECT id, pet_id, ROW_NUMBER() OVER (PARTITION BY pet_id ORDER BY updated_at DESC) as rn
  FROM medical
),
medical_to_delete AS (
  SELECT id FROM ranked_medical WHERE rn > 1
)
DELETE FROM medical WHERE id IN (SELECT id FROM medical_to_delete);

WITH ranked_professional AS (
  SELECT id, pet_id, ROW_NUMBER() OVER (PARTITION BY pet_id ORDER BY updated_at DESC) as rn
  FROM professional_data
),
professional_to_delete AS (
  SELECT id FROM ranked_professional WHERE rn > 1
)
DELETE FROM professional_data WHERE id IN (SELECT id FROM professional_to_delete);

-- Now add unique constraints to prevent future duplicates
ALTER TABLE contacts ADD CONSTRAINT contacts_pet_id_unique UNIQUE (pet_id);
ALTER TABLE medical ADD CONSTRAINT medical_pet_id_unique UNIQUE (pet_id);
ALTER TABLE professional_data ADD CONSTRAINT professional_data_pet_id_unique UNIQUE (pet_id);
