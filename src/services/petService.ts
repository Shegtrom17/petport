
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type PetWithDetails = {
  id: string;
  name: string;
  breed: string | null;
  species: string | null;
  age: string | null;
  weight: string | null;
  microchip_id: string | null;
  pet_pass_id: string | null;
  bio: string | null;
  notes: string | null;
  contacts?: Tables<"contacts"> | null;
  medical?: Tables<"medical"> | null;
  photos?: Tables<"pet_photos"> | null;
  professional_data?: Tables<"professional_data"> | null;
  gallery_photos?: Tables<"gallery_photos">[];
  experiences?: Tables<"experiences">[];
  achievements?: Tables<"achievements">[];
  training?: Tables<"training">[];
  reviews?: Tables<"reviews">[];
  travel_locations?: Tables<"travel_locations">[];
  documents?: Tables<"documents">[];
};

// Transform database data to component-expected format
export function transformPetData(pet: PetWithDetails): any {
  return {
    id: pet.id,
    name: pet.name,
    breed: pet.breed,
    species: pet.species,
    age: pet.age,
    weight: pet.weight,
    microchipId: pet.microchip_id,
    petPassId: pet.pet_pass_id,
    bio: pet.bio,
    notes: pet.notes,
    // Transform contacts
    vetContact: pet.contacts?.vet_contact || "",
    emergencyContact: pet.contacts?.emergency_contact || "",
    secondEmergencyContact: pet.contacts?.second_emergency_contact || "",
    petCaretaker: pet.contacts?.pet_caretaker || "",
    // Transform medical
    medicalAlert: pet.medical?.medical_alert || false,
    medicalConditions: pet.medical?.medical_conditions || "",
    medications: pet.medical?.medications || [],
    lastVaccination: pet.medical?.last_vaccination || "",
    medicalEmergencyDocument: pet.medical?.medical_emergency_document || null,
    // Transform photos
    photoUrl: pet.photos?.photo_url || "",
    fullBodyPhotoUrl: pet.photos?.full_body_photo_url || "",
    // Transform professional data
    badges: pet.professional_data?.badges || [],
    supportAnimalStatus: pet.professional_data?.support_animal_status || null,
    // Transform other arrays
    experiences: pet.experiences || [],
    achievements: pet.achievements || [],
    training: pet.training || [],
    reviews: pet.reviews?.map(review => ({
      id: review.id,
      reviewerName: review.reviewer_name,
      reviewerContact: review.reviewer_contact,
      rating: review.rating,
      text: review.text,
      date: review.date,
      location: review.location,
      type: review.type
    })) || [],
    travel_locations: pet.travel_locations || [],
    documents: pet.documents || [],
    gallery_photos: pet.gallery_photos || []
  };
}

export async function fetchUserPets(): Promise<any[]> {
  try {
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pets:", error);
      throw error;
    }

    if (!pets || pets.length === 0) {
      return [];
    }

    // Transform the pets data to match component expectations
    return pets.map(pet => transformPetData(pet as PetWithDetails));
  } catch (error) {
    console.error("Error in fetchUserPets:", error);
    return [];
  }
}

export async function fetchPetDetails(petId: string): Promise<any | null> {
  try {
    // First fetch the pet
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", petId)
      .single();

    if (error || !pet) {
      console.error("Error fetching pet:", error);
      return null;
    }

    // Then fetch all related data
    const [
      contactsResponse,
      medicalResponse,
      photosResponse,
      professionalResponse,
      galleryResponse,
      experiencesResponse,
      achievementsResponse,
      trainingResponse,
      reviewsResponse,
      travelResponse,
      documentsResponse
    ] = await Promise.all([
      supabase.from("contacts").select("*").eq("pet_id", petId).maybeSingle(),
      supabase.from("medical").select("*").eq("pet_id", petId).maybeSingle(),
      supabase.from("pet_photos").select("*").eq("pet_id", petId).maybeSingle(),
      supabase.from("professional_data").select("*").eq("pet_id", petId).maybeSingle(),
      supabase.from("gallery_photos").select("*").eq("pet_id", petId),
      supabase.from("experiences").select("*").eq("pet_id", petId),
      supabase.from("achievements").select("*").eq("pet_id", petId),
      supabase.from("training").select("*").eq("pet_id", petId),
      supabase.from("reviews").select("*").eq("pet_id", petId),
      supabase.from("travel_locations").select("*").eq("pet_id", petId),
      supabase.from("documents").select("*").eq("pet_id", petId)
    ]);

    // Combine all data
    const petWithDetails: PetWithDetails = {
      ...pet,
      contacts: contactsResponse.data,
      medical: medicalResponse.data,
      photos: photosResponse.data,
      professional_data: professionalResponse.data,
      gallery_photos: galleryResponse.data || [],
      experiences: experiencesResponse.data || [],
      achievements: achievementsResponse.data || [],
      training: trainingResponse.data || [],
      reviews: reviewsResponse.data || [],
      travel_locations: travelResponse.data || [],
      documents: documentsResponse.data || []
    };

    return transformPetData(petWithDetails);
  } catch (error) {
    console.error("Error in fetchPetDetails:", error);
    return null;
  }
}

export async function createPet(petData: {
  name: string;
  breed?: string;
  species?: string;
  age?: string;
  weight?: string;
  microchip_id?: string;
  bio?: string;
  notes?: string;
}): Promise<string | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Add user_id to pet data
    const petDataWithUser = {
      ...petData,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("pets")
      .insert([petDataWithUser])
      .select();

    if (error) {
      console.error("Error creating pet:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned after creating pet");
    }

    return data[0].id;
  } catch (error) {
    console.error("Error in createPet:", error);
    return null;
  }
}
