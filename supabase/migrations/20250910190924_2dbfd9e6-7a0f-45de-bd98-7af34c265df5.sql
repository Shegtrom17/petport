-- Add position column to gallery_photos for drag-and-drop ordering
ALTER TABLE gallery_photos ADD COLUMN position INTEGER DEFAULT 0;

-- Create index for better performance on position queries
CREATE INDEX idx_gallery_photos_position ON gallery_photos(pet_id, position);

-- Create a function to update existing photos with sequential positions
CREATE OR REPLACE FUNCTION update_gallery_photo_positions()
RETURNS void AS $$
DECLARE
    pet_record RECORD;
    photo_record RECORD;
    pos INTEGER;
BEGIN
    -- For each pet, update their gallery photos with sequential positions
    FOR pet_record IN SELECT DISTINCT pet_id FROM gallery_photos WHERE position = 0 LOOP
        pos := 1;
        FOR photo_record IN 
            SELECT id FROM gallery_photos 
            WHERE pet_id = pet_record.pet_id AND position = 0 
            ORDER BY created_at 
        LOOP
            UPDATE gallery_photos SET position = pos WHERE id = photo_record.id;
            pos := pos + 1;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update existing photos
SELECT update_gallery_photo_positions();

-- Drop the function as it's no longer needed
DROP FUNCTION update_gallery_photo_positions();