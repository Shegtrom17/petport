-- Fix security warnings by dropping triggers first, then functions, then recreating with proper security

-- Drop triggers first
DROP TRIGGER IF EXISTS sync_travel_location_pins_trigger ON public.travel_locations;
DROP TRIGGER IF EXISTS update_travel_location_pins_trigger ON public.travel_locations;
DROP TRIGGER IF EXISTS cleanup_travel_location_pins_trigger ON public.travel_locations;

-- Drop functions
DROP FUNCTION IF EXISTS public.sync_travel_location_pins();
DROP FUNCTION IF EXISTS public.update_travel_location_pins();
DROP FUNCTION IF EXISTS public.cleanup_travel_location_pins();

-- Recreate functions with proper security
CREATE OR REPLACE FUNCTION public.sync_travel_location_pins()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    location_coords RECORD;
BEGIN
    -- Simple coordinate mapping for common locations
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
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_travel_location_pins()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.map_pins 
    SET 
        title = NEW.name,
        description = COALESCE(NEW.notes, 'Visited ' || NEW.name),
        updated_at = now()
    WHERE travel_location_id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_travel_location_pins()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.map_pins 
    SET 
        travel_location_id = NULL,
        category = 'custom',
        updated_at = now()
    WHERE travel_location_id = OLD.id;

    RETURN OLD;
END;
$$;

-- Recreate triggers
CREATE TRIGGER sync_travel_location_pins_trigger
    AFTER INSERT ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_travel_location_pins();

CREATE TRIGGER update_travel_location_pins_trigger
    AFTER UPDATE ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_travel_location_pins();

CREATE TRIGGER cleanup_travel_location_pins_trigger
    AFTER DELETE ON public.travel_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_travel_location_pins();