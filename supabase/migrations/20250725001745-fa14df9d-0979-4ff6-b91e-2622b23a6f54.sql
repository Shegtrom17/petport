-- Enhance map_pins table with additional fields for better pin management
ALTER TABLE public.map_pins 
ADD COLUMN title TEXT,
ADD COLUMN description TEXT,
ADD COLUMN category TEXT DEFAULT 'custom',
ADD COLUMN travel_location_id UUID REFERENCES public.travel_locations(id) ON DELETE SET NULL,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for performance
CREATE INDEX idx_map_pins_travel_location ON public.map_pins(travel_location_id);
CREATE INDEX idx_map_pins_category ON public.map_pins(category);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_map_pins_updated_at
    BEFORE UPDATE ON public.map_pins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create pins for travel locations
CREATE OR REPLACE FUNCTION public.sync_travel_location_pins()
RETURNS TRIGGER AS $$
DECLARE
    location_coords RECORD;
BEGIN
    -- Simple coordinate mapping for common locations
    -- This is a basic implementation - in production you'd want a proper geocoding service
    IF NEW.type = 'country' THEN
        CASE NEW.name
            WHEN 'United States' THEN location_coords := ROW(39.8283, -98.5795);
            WHEN 'Canada' THEN location_coords := ROW(56.1304, -106.3468);
            WHEN 'United Kingdom' THEN location_coords := ROW(55.3781, -3.4360);
            WHEN 'France' THEN location_coords := ROW(46.2276, 2.2137);
            WHEN 'Germany' THEN location_coords := ROW(51.1657, 10.4515);
            WHEN 'Japan' THEN location_coords := ROW(36.2048, 138.2529);
            WHEN 'Australia' THEN location_coords := ROW(-25.2744, 133.7751);
            ELSE location_coords := NULL;
        END CASE;
    ELSIF NEW.type = 'state' THEN
        CASE NEW.name
            WHEN 'California' THEN location_coords := ROW(36.7783, -119.4179);
            WHEN 'New York' THEN location_coords := ROW(42.1657, -74.9481);
            WHEN 'Texas' THEN location_coords := ROW(31.9686, -99.9018);
            WHEN 'Florida' THEN location_coords := ROW(27.7663, -81.6868);
            ELSE location_coords := NULL;
        END CASE;
    END IF;

    -- Create pin if coordinates are available
    IF location_coords IS NOT NULL THEN
        INSERT INTO public.map_pins (
            pet_id,
            latitude,
            longitude,
            title,
            description,
            category,
            travel_location_id
        ) VALUES (
            NEW.pet_id,
            location_coords.f1,
            location_coords.f2,
            NEW.name,
            COALESCE(NEW.notes, 'Visited ' || NEW.name),
            'travel_location',
            NEW.id
        )
        ON CONFLICT DO NOTHING; -- Prevent duplicates
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create pins for new travel locations
CREATE TRIGGER sync_travel_location_pins_trigger
    AFTER INSERT ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_travel_location_pins();

-- Function to update pins when travel locations are updated
CREATE OR REPLACE FUNCTION public.update_travel_location_pins()
RETURNS TRIGGER AS $$
BEGIN
    -- Update existing linked pins
    UPDATE public.map_pins 
    SET 
        title = NEW.name,
        description = COALESCE(NEW.notes, 'Visited ' || NEW.name),
        updated_at = now()
    WHERE travel_location_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update pins when travel locations are updated
CREATE TRIGGER update_travel_location_pins_trigger
    AFTER UPDATE ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_travel_location_pins();

-- Function to clean up pins when travel locations are deleted
CREATE OR REPLACE FUNCTION public.cleanup_travel_location_pins()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete or unlink pins when travel location is deleted
    UPDATE public.map_pins 
    SET 
        travel_location_id = NULL,
        category = 'custom',
        updated_at = now()
    WHERE travel_location_id = OLD.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle travel location deletion
CREATE TRIGGER cleanup_travel_location_pins_trigger
    AFTER DELETE ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_travel_location_pins();