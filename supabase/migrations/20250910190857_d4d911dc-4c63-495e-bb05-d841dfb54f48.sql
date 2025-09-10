-- Add position column to gallery_photos for drag-and-drop ordering
ALTER TABLE gallery_photos ADD COLUMN position INTEGER DEFAULT 0;

-- Create index for better performance on position queries
CREATE INDEX idx_gallery_photos_position ON gallery_photos(pet_id, position);

-- Update existing photos to have sequential positions
UPDATE gallery_photos 
SET position = row_number() OVER (PARTITION BY pet_id ORDER BY created_at)
WHERE position = 0;