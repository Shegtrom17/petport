
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

export async function fetchUserPets(): Promise<PetWithDetails[]> {
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

    // Return the pets
    return pets;
  } catch (error) {
    console.error("Error in fetchUserPets:", error);
    return [];
  }
}

export async function fetchPetDetails(petId: string): Promise<PetWithDetails | null> {
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
    return {
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
    const { data, error } = await supabase
      .from("pets")
      .insert([petData])
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
