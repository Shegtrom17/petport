-- Create function to check if user can add more pets
CREATE OR REPLACE FUNCTION public.can_user_add_pet(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT 
      (SELECT COUNT(*) FROM pets WHERE user_id = user_uuid) < (pet_limit + additional_pets)
     FROM subscribers 
     WHERE user_id = user_uuid AND subscribed = true
    ), 
    false
  );
$$;

-- Create function to get user's pet limit
CREATE OR REPLACE FUNCTION public.get_user_pet_limit(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT pet_limit + additional_pets FROM subscribers WHERE user_id = user_uuid AND subscribed = true),
    0
  );
$$;