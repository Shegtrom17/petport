
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type PetWithDetails = {
  id: string;
  name: string;
  breed: string | null;
  species: string | null;
  age: string | null;
  weight: string | null;
  height: string | null;
  sex: string | null;
  microchip_id: string | null;
  registration_number: string | null;
  petport_id: string | null;
  bio: string | null;
  notes: string | null;
  state: string | null;
  county: string | null;
  is_public?: boolean | null;
  organization_name?: string | null;
  organization_email?: string | null;
  organization_phone?: string | null;
  organization_website?: string | null;
  custom_logo_url?: string | null;
  adoption_status?: string | null;
  adoption_instructions?: string | null;
  contacts?: Tables<"contacts"> | null;
  medical?: Tables<"medical"> | null;
  photos?: Tables<"pet_photos"> | null;
  professional_data?: Tables<"professional_data"> | null;
  care_instructions?: Tables<"care_instructions"> | null;
  gallery_photos?: Tables<"gallery_photos">[];
  experiences?: Tables<"experiences">[];
  achievements?: Tables<"achievements">[];
  training?: Tables<"training">[];
  reviews?: Tables<"reviews">[];
  travel_locations?: Tables<"travel_locations">[];
  documents?: Tables<"documents">[];
  certifications?: Tables<"certifications">[];
  lost_pet_data?: Tables<"lost_pet_data"> | null;
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
    height: pet.height,
    sex: pet.sex,
    microchipId: pet.microchip_id,
    registrationNumber: pet.registration_number,
    petPortId: pet.petport_id,
    petPassId: pet.petport_id, // Map to both for compatibility
    bio: pet.bio,
    notes: pet.notes,
    state: pet.state,
    county: pet.county,
    is_public: pet.is_public,
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
    supportAnimalStatus: pet.professional_data?.support_animal_status || null,
    // Transform care instructions
    careInstructions: pet.care_instructions ? {
      feedingSchedule: pet.care_instructions.feeding_schedule,
      morningRoutine: pet.care_instructions.morning_routine,
      eveningRoutine: pet.care_instructions.evening_routine,
      allergies: pet.care_instructions.allergies,
      behavioralNotes: pet.care_instructions.behavioral_notes,
      favoriteActivities: pet.care_instructions.favorite_activities
    } : null,
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
    // Transform travel locations with proper mapping
    travel_locations: pet.travel_locations?.map(location => ({
      id: location.id,
      name: location.name,
      type: location.type,
      code: location.code,
      date_visited: location.date_visited,
      photo_url: location.photo_url,
      notes: location.notes
    })) || [],
    documents: pet.documents || [],
    gallery_photos: pet.gallery_photos || [],
    certifications: pet.certifications || [],
    // Transform organization fields
    organizationName: pet.organization_name || "",
    organizationEmail: pet.organization_email || "",
    organizationPhone: pet.organization_phone || "",
    organizationWebsite: pet.organization_website || "",
    customLogoUrl: pet.custom_logo_url || "",
    adoptionStatus: pet.adoption_status || "not_available",
    adoptionInstructions: pet.adoption_instructions || "",
    // Transform lost pet data
    is_lost: pet.lost_pet_data?.is_missing || false,
    lost_pet_data: pet.lost_pet_data
  };
}

export async function fetchUserPets(): Promise<any[]> {
  try {
    console.log("fetchUserPets: Starting to fetch user pets");
    
    // Get current user first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("fetchUserPets: User check result:", { user: user?.id, error: userError });
    
    if (userError) {
      console.error("fetchUserPets: Error getting user:", userError);
      return [];
    }
    
    if (!user) {
      console.log("fetchUserPets: No authenticated user found");
      return [];
    }

    const { data: pets, error } = await supabase
      .from("pets")
      .select("id, name, breed, species, age, weight, height, sex, microchip_id, registration_number, petport_id, bio, notes, state, county, created_at, updated_at, user_id, is_public, organization_name, organization_email, organization_phone, organization_website, custom_logo_url, adoption_status, adoption_instructions")
      .eq('user_id', user.id) // Explicitly filter by user_id
      .order("created_at", { ascending: false });

    console.log("fetchUserPets: Database response:", { pets, error, userIdFilter: user.id });

    if (error) {
      console.error("fetchUserPets: Database error:", error);
      throw error;
    }

    if (!pets || pets.length === 0) {
      console.log("fetchUserPets: No pets found for user:", user.id);
      return [];
    }

    console.log("fetchUserPets: Found pets:", pets.length);

    return pets.map(pet => {
      const petWithDetails: PetWithDetails = {
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        species: pet.species,
        age: pet.age,
        weight: pet.weight,
        height: pet.height,
        sex: pet.sex,
        microchip_id: pet.microchip_id,
        registration_number: pet.registration_number,
        petport_id: pet.petport_id,
        bio: pet.bio,
        notes: pet.notes,
        state: pet.state,
        county: pet.county,
        is_public: pet.is_public,
        organization_name: pet.organization_name,
        organization_email: pet.organization_email,
        organization_phone: pet.organization_phone,
        organization_website: pet.organization_website,
        custom_logo_url: pet.custom_logo_url,
        adoption_status: pet.adoption_status,
        adoption_instructions: pet.adoption_instructions,
        contacts: null,
        medical: null,
        photos: null,
        professional_data: null,
        care_instructions: null,
        gallery_photos: [],
        experiences: [],
        achievements: [],
        training: [],
        reviews: [],
        travel_locations: [],
        documents: [],
        certifications: []
      };
      return transformPetData(petWithDetails);
    });
  } catch (error) {
    console.error("fetchUserPets: Error:", error);
    return [];
  }
}

export async function fetchPetDetails(petId: string): Promise<any | null> {
  try {
    const { data: pet, error } = await supabase
      .from("pets")
      .select("id, name, breed, species, age, weight, height, sex, microchip_id, registration_number, petport_id, bio, notes, state, county, created_at, updated_at, user_id, is_public, organization_name, organization_email, organization_phone, organization_website, custom_logo_url, adoption_status, adoption_instructions")
      .eq("id", petId)
      .single();

    if (error || !pet) {
      console.error("Error fetching pet:", error);
      return null;
    }

    const [
      contactsResponse,
      medicalResponse,
      photosResponse,
      professionalResponse,
      careInstructionsResponse,
      galleryResponse,
      experiencesResponse,
      achievementsResponse,
      trainingResponse,
      reviewsResponse,
      travelResponse,
      documentsResponse,
      certificationsResponse,
      lostPetResponse
    ] = await Promise.all([
      supabase.from("contacts").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("medical").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("pet_photos").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("professional_data").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("care_instructions").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("gallery_photos").select("*").eq("pet_id", petId).order("position", { ascending: true }),
      supabase.from("experiences").select("*").eq("pet_id", petId),
      supabase.from("achievements").select("*").eq("pet_id", petId),
      supabase.from("training").select("*").eq("pet_id", petId),
      supabase.from("reviews").select("*").eq("pet_id", petId),
      supabase.from("travel_locations").select("*").eq("pet_id", petId),
      supabase.from("documents").select("*").eq("pet_id", petId),
      supabase.from("certifications").select("*").eq("pet_id", petId),
      supabase.from("lost_pet_data").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle()
    ]);

    if (contactsResponse.error) console.error("Error fetching contacts:", contactsResponse.error);
    if (medicalResponse.error) console.error("Error fetching medical:", medicalResponse.error);
    if (photosResponse.error) console.error("Error fetching photos:", photosResponse.error);
    if (professionalResponse.error) console.error("Error fetching professional:", professionalResponse.error);
    if (careInstructionsResponse.error) console.error("Error fetching care instructions:", careInstructionsResponse.error);

    const petWithDetails: PetWithDetails = {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      age: pet.age,
      weight: pet.weight,
      height: pet.height,
      sex: pet.sex,
      microchip_id: pet.microchip_id,
      registration_number: pet.registration_number,
      petport_id: pet.petport_id,
      bio: pet.bio,
      notes: pet.notes,
      state: pet.state,
      county: pet.county,
      is_public: pet.is_public,
      organization_name: pet.organization_name,
      organization_email: pet.organization_email,
      organization_phone: pet.organization_phone,
      organization_website: pet.organization_website,
      custom_logo_url: pet.custom_logo_url,
      adoption_status: pet.adoption_status,
      adoption_instructions: pet.adoption_instructions,
      contacts: contactsResponse.data,
      medical: medicalResponse.data,
      photos: photosResponse.data,
      professional_data: professionalResponse.data,
      care_instructions: careInstructionsResponse.data,
      gallery_photos: galleryResponse.data || [],
      experiences: experiencesResponse.data || [],
      achievements: achievementsResponse.data || [],
      training: trainingResponse.data || [],
      reviews: reviewsResponse.data || [],
      travel_locations: travelResponse.data || [],
      documents: documentsResponse.data || [],
      certifications: certificationsResponse.data || [],
      lost_pet_data: lostPetResponse.data
    };

    console.log("Fetched pet with details:", petWithDetails);
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
  height?: string;
  sex?: string;
  microchip_id?: string;
  registration_number?: string;
  bio?: string;
  notes?: string;
}): Promise<string | null> {
  try {
    console.log("=== CREATE PET DEBUG START ===");
    console.log("createPet: Starting pet creation process");
    console.log("createPet: Input data:", JSON.stringify(petData, null, 2));
    
    // Step 1: Get current authenticated user
    console.log("createPet: Step 1 - Getting authenticated user");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("createPet: User authentication result:", { 
      userId: user?.id, 
      userEmail: user?.email,
      error: userError 
    });
    
    if (userError) {
      console.error("createPet: Authentication error:", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      console.error("createPet: No authenticated user found");
      throw new Error("You must be logged in to create a pet");
    }

    // Step 2: Prepare pet data with user_id
    console.log("createPet: Step 2 - Preparing pet data");
    const petDataWithUser = {
      name: petData.name,
      breed: petData.breed || null,
      species: petData.species || null,
      age: petData.age || null,
      weight: petData.weight || null,
      height: petData.height || null,
      sex: petData.sex || null,
      microchip_id: petData.microchip_id || null,
      registration_number: petData.registration_number || null,
      bio: petData.bio || null,
      notes: petData.notes || null,
      user_id: user.id  // This is the critical field that links the pet to the user
    };

    console.log("createPet: Final data to insert:", JSON.stringify(petDataWithUser, null, 2));

    // Step 3: Test database connection first
    console.log("createPet: Step 3 - Testing database connection");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("pets")
      .select("count", { count: 'exact' })
      .limit(1);
    
    console.log("createPet: Connection test result:", { 
      connectionTest, 
      connectionError,
      canAccessPetsTable: !connectionError 
    });

    if (connectionError) {
      console.error("createPet: Database connection failed:", connectionError);
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }

    // Step 4: Insert the pet
    console.log("createPet: Step 4 - Inserting pet into database");
    const { data, error } = await supabase
      .from("pets")
      .insert([petDataWithUser])
      .select('*')
      .single();

    console.log("createPet: Database insert response:", { 
      success: !error,
      data: data ? {
        id: data.id,
        name: data.name,
        user_id: data.user_id,
        petport_id: data.petport_id,
        created_at: data.created_at
      } : null,
      error: error 
    });

    if (error) {
      console.error("createPet: Database insertion error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to create pet: ${error.message}`);
    }

    if (!data) {
      console.error("createPet: No data returned from database insert");
      throw new Error("Pet creation failed - no data returned from database");
    }

    // Step 5: Verify the pet was actually inserted by querying it back
    console.log("createPet: Step 5 - Verifying pet was inserted");
    const { data: verifyData, error: verifyError } = await supabase
      .from("pets")
      .select('id, name, user_id, petport_id, created_at')
      .eq('id', data.id)
      .single();

    console.log("createPet: Verification query result:", {
      found: !verifyError && verifyData,
      verifyData: verifyData,
      verifyError: verifyError
    });

    // Step 6: Count total pets for this user
    console.log("createPet: Step 6 - Counting user's total pets");
    const { count, error: countError } = await supabase
      .from("pets")
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    console.log("createPet: User's total pets count:", { count, countError });

    console.log("createPet: SUCCESS - Pet created with ID:", data.id);
    console.log("=== CREATE PET DEBUG END ===");

    return data.id;
  } catch (error) {
    console.error("=== CREATE PET ERROR ===");
    console.error("createPet: Unexpected error:", error);
    console.error("createPet: Error type:", typeof error);
    console.error("createPet: Error constructor:", error?.constructor?.name);
    if (error instanceof Error) {
      console.error("createPet: Error message:", error.message);
      console.error("createPet: Error stack:", error.stack);
    }
    console.error("=== CREATE PET ERROR END ===");
    throw error;
  }
}

export async function updatePetBasicInfo(petId: string, basicData: {
  name?: string;
  breed?: string;
  species?: string;
  age?: string;
  weight?: string;
  height?: string;
  sex?: string;
  microchip_id?: string;
  registration_number?: string;
  bio?: string;
  notes?: string;
  state?: string;
  county?: string;
  organization_name?: string;
  organization_email?: string;
  organization_phone?: string;
  organization_website?: string;
  custom_logo_url?: string;
  adoption_status?: string;
  adoption_instructions?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("pets")
      .update({
        ...basicData,
        updated_at: new Date().toISOString()
      })
      .eq("id", petId);

    if (error) {
      console.error("Error updating basic pet info:", error);
      throw error;
    }

    console.log("Basic pet info updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updatePetBasicInfo:", error);
    return false;
  }
}

export async function updatePetContacts(petId: string, contactData: {
  vet_contact?: string;
  emergency_contact?: string;
  second_emergency_contact?: string;
  pet_caretaker?: string;
}): Promise<boolean> {
  try {
    console.log("Updating contacts for pet:", petId, "with data:", contactData);
    
    const { error } = await supabase
      .from("contacts")
      .upsert({
        pet_id: petId,
        ...contactData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'pet_id'
      });

    if (error) {
      console.error("Error updating contacts:", error);
      throw error;
    }

    console.log("Contacts updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updatePetContacts:", error);
    return false;
  }
}

export async function updatePetMedical(petId: string, medicalData: {
  medical_alert?: boolean;
  medical_conditions?: string;
  medications?: string[];
  last_vaccination?: string;
  medical_emergency_document?: string;
}): Promise<boolean> {
  try {
    console.log("Updating medical for pet:", petId, "with data:", medicalData);
    
    const { error } = await supabase
      .from("medical")
      .upsert({
        pet_id: petId,
        ...medicalData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'pet_id'
      });

    if (error) {
      console.error("Error updating medical:", error);
      throw error;
    }

    console.log("Medical info updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updatePetMedical:", error);
    return false;
  }
}

export async function updatePetExperience(petId: string, experiences: {
  activity: string;
  contact?: string;
  description?: string;
}[]): Promise<boolean> {
  try {
    await supabase
      .from("experiences")
      .delete()
      .eq("pet_id", petId);

    if (experiences.length > 0) {
      const { error } = await supabase
        .from("experiences")
        .insert(experiences.map(exp => ({
          pet_id: petId,
          activity: exp.activity,
          contact: exp.contact,
          description: exp.description
        })));

      if (error) {
        console.error("Error updating experiences:", error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updatePetExperience:", error);
    return false;
  }
}

export async function updatePetAchievements(petId: string, achievements: {
  title: string;
  description?: string;
}[]): Promise<boolean> {
  try {
    await supabase
      .from("achievements")
      .delete()
      .eq("pet_id", petId);

    if (achievements.length > 0) {
      const { error } = await supabase
        .from("achievements")
        .insert(achievements.map(achievement => ({
          pet_id: petId,
          title: achievement.title,
          description: achievement.description
        })));

      if (error) {
        console.error("Error updating achievements:", error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updatePetAchievements:", error);
    return false;
  }
}

export async function updatePetTraining(petId: string, training: {
  course: string;
  facility?: string;
  phone?: string;
  completed?: string;
}[]): Promise<boolean> {
  try {
    await supabase
      .from("training")
      .delete()
      .eq("pet_id", petId);

    if (training.length > 0) {
      const { error } = await supabase
        .from("training")
        .insert(training.map(course => ({
          pet_id: petId,
          course: course.course,
          facility: course.facility,
          phone: course.phone,
          completed: course.completed
        })));

      if (error) {
        console.error("Error updating training:", error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updatePetTraining:", error);
    return false;
  }
}

export async function updatePetReviews(petId: string, reviews: {
  reviewerName: string;
  reviewerContact?: string;
  rating: number;
  text?: string;
  date?: string;
  location?: string;
  type?: string;
}[]): Promise<boolean> {
  try {
    await supabase
      .from("reviews")
      .delete()
      .eq("pet_id", petId);

    if (reviews.length > 0) {
      const { error } = await supabase
        .from("reviews")
        .insert(reviews.map(review => ({
          pet_id: petId,
          reviewer_name: review.reviewerName,
          reviewer_contact: review.reviewerContact,
          rating: review.rating,
          text: review.text,
          date: review.date,
          location: review.location,
          type: review.type
        })));

      if (error) {
        console.error("Error updating reviews:", error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error in updatePetReviews:", error);
    return false;
  }
}

export async function updateTravelLocations(petId: string, locations: {
  name: string;
  type: string;
  code?: string;
  dateVisited?: string;
  photoUrl?: string;
  notes?: string;
}[]): Promise<boolean> {
  try {
    console.log("Updating travel locations for pet:", petId, "with locations:", locations);
    
    const { error: deleteError } = await supabase
      .from("travel_locations")
      .delete()
      .eq("pet_id", petId);

    if (deleteError) {
      console.error("Error deleting existing travel locations:", deleteError);
      throw deleteError;
    }

    if (locations.length > 0) {
      const locationsToInsert = locations.map(location => ({
        pet_id: petId,
        name: location.name,
        type: location.type,
        code: location.code,
        date_visited: location.dateVisited,
        photo_url: location.photoUrl,
        notes: location.notes
      }));

      console.log("Inserting travel locations:", locationsToInsert);

      const { error: insertError } = await supabase
        .from("travel_locations")
        .insert(locationsToInsert);

      if (insertError) {
        console.error("Error inserting travel locations:", insertError);
        throw insertError;
      }
    }

    console.log("Travel locations updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateTravelLocations:", error);
    return false;
  }
}

export async function updateProfessionalData(petId: string, data: {
  badges?: string[];
  supportAnimalStatus?: string;
}): Promise<boolean> {
  try {
    console.log("Updating professional data for pet:", petId, "with data:", data);
    
    const dbData = {
      pet_id: petId,
      badges: data.badges,
      support_animal_status: data.supportAnimalStatus,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from("professional_data")
      .upsert(dbData, {
        onConflict: 'pet_id'
      });

    if (error) {
      console.error("Error updating professional data:", error);
      throw error;
    }

    console.log("Professional data updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateProfessionalData:", error);
    return false;
  }
}

export async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return null;
  }
}

export async function uploadPetPhotos(petId: string, photos: {
  profilePhoto?: File;
  fullBodyPhoto?: File;
}): Promise<boolean> {
  try {
    const uploads: Promise<string | null>[] = [];
    let photoUrl = null;
    let fullBodyPhotoUrl = null;

    if (photos.profilePhoto) {
      const profilePath = `${petId}/profile-${Date.now()}.${photos.profilePhoto.name.split('.').pop()}`;
      uploads.push(uploadFile(photos.profilePhoto, 'pet_photos', profilePath));
    }

    if (photos.fullBodyPhoto) {
      const fullBodyPath = `${petId}/fullbody-${Date.now()}.${photos.fullBodyPhoto.name.split('.').pop()}`;
      uploads.push(uploadFile(photos.fullBodyPhoto, 'pet_photos', fullBodyPath));
    }

    const results = await Promise.all(uploads);
    
    if (photos.profilePhoto && results[0]) {
      photoUrl = results[0];
    }
    if (photos.fullBodyPhoto && results[photos.profilePhoto ? 1 : 0]) {
      fullBodyPhotoUrl = results[photos.profilePhoto ? 1 : 0];
    }

    const { error } = await supabase.rpc('handle_photo_upload', {
      _pet_id: petId,
      _photo_url: photoUrl,
      _full_body_photo_url: fullBodyPhotoUrl
    });

    if (error) {
      console.error("Error updating photos in database:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in uploadPetPhotos:", error);
    return false;
  }
}

export async function uploadGalleryPhoto(petId: string, photo: File, caption?: string): Promise<boolean> {
  try {
    const photoPath = `${petId}/gallery-${Date.now()}.${photo.name.split('.').pop()}`;
    const photoUrl = await uploadFile(photo, 'pet_photos', photoPath);

    if (!photoUrl) {
      throw new Error("Failed to upload photo");
    }

    const { error } = await supabase.rpc('handle_gallery_photo_upload', {
      _pet_id: petId,
      _url: photoUrl,
      _caption: caption || null
    });

    if (error) {
      console.error("Error creating gallery photo record:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in uploadGalleryPhoto:", error);
    return false;
  }
}

export async function uploadMultipleGalleryPhotos(
  petId: string, 
  photos: File[], 
  captions: string[] = []
): Promise<{ success: boolean; uploaded: number; failed: number }> {
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const caption = captions[i] || '';
    
    try {
      const success = await uploadGalleryPhoto(petId, photo, caption);
      if (success) {
        uploaded++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to upload photo ${i + 1}:`, error);
      failed++;
    }
  }

  return { success: failed === 0, uploaded, failed };
}

export async function deleteGalleryPhoto(photoId: string, photoUrl: string): Promise<boolean> {
  try {
    // Delete from storage first
    const deletedFromStorage = await deletePhotoFromStorage(photoUrl);
    if (!deletedFromStorage) {
      console.warn("Failed to delete photo from storage, continuing with database deletion");
    }

    // Delete from database
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error("Error deleting gallery photo from database:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteGalleryPhoto:", error);
    return false;
  }
}

export async function updateGalleryPhotoCaption(photoId: string, caption: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gallery_photos')
      .update({ caption: caption.trim() || null })
      .eq('id', photoId);

    if (error) {
      console.error("Error updating gallery photo caption:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in updateGalleryPhotoCaption:", error);
    return false;
  }
}

export async function reorderGalleryPhotos(petId: string, photos: { id: string; position: number }[]): Promise<boolean> {
  try {
    // Update all photos with their new positions
    const updates = photos.map(photo => 
      supabase
        .from('gallery_photos')
        .update({ position: photo.position })
        .eq('id', photo.id)
        .eq('pet_id', petId)
    );

    const results = await Promise.all(updates);
    
    // Check if any updates failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      console.error("Error updating gallery photo positions:", results.find(r => r.error)?.error);
      throw new Error("Failed to update photo positions");
    }

    return true;
  } catch (error) {
    console.error("Error in reorderGalleryPhotos:", error);
    return false;
  }
}

export async function deletePhotoFromStorage(photoUrl: string): Promise<boolean> {
  try {
    if (!photoUrl || photoUrl === "/placeholder.svg") {
      return true; // Nothing to delete
    }

    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'pet_photos');
    if (bucketIndex === -1) {
      console.error("Invalid photo URL format:", photoUrl);
      return false;
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('pet_photos')
      .remove([filePath]);

    if (error) {
      console.error("Error deleting photo from storage:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deletePhotoFromStorage:", error);
    return false;
  }
}

export async function deleteOfficialPhoto(petId: string, photoType: 'profile' | 'fullBody'): Promise<boolean> {
  try {
    // First get current photo URLs to delete from storage
    const petDetails = await fetchPetDetails(petId);
    if (!petDetails) {
      throw new Error("Pet not found");
    }

    const currentPhotoUrl = photoType === 'profile' ? petDetails.photoUrl : petDetails.fullBodyPhotoUrl;
    
    // Delete from storage
    await deletePhotoFromStorage(currentPhotoUrl);

    // Update database to remove photo URL
    const updateData = photoType === 'profile' 
      ? { _photo_url: null }
      : { _full_body_photo_url: null };

    const { error } = await supabase.rpc('handle_photo_upload', {
      _pet_id: petId,
      ...updateData
    });

    if (error) {
      console.error("Error updating photo in database:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteOfficialPhoto:", error);
    return false;
  }
}

export async function replaceOfficialPhoto(petId: string, photo: File, photoType: 'profile' | 'fullBody'): Promise<boolean> {
  try {
    // First get current photo URL to delete old one
    const petDetails = await fetchPetDetails(petId);
    if (petDetails) {
      const currentPhotoUrl = photoType === 'profile' ? petDetails.photoUrl : petDetails.fullBodyPhotoUrl;
      if (currentPhotoUrl && currentPhotoUrl !== "/placeholder.svg") {
        await deletePhotoFromStorage(currentPhotoUrl);
      }
    }

    // Upload new photo
    const photoPath = `${petId}/${photoType}-${Date.now()}.${photo.name.split('.').pop()}`;
    const photoUrl = await uploadFile(photo, 'pet_photos', photoPath);

    if (!photoUrl) {
      throw new Error("Failed to upload new photo");
    }

    // Update database with new photo URL
    const updateData = photoType === 'profile' 
      ? { _photo_url: photoUrl }
      : { _full_body_photo_url: photoUrl };

    const { error } = await supabase.rpc('handle_photo_upload', {
      _pet_id: petId,
      ...updateData
    });

    if (error) {
      console.error("Error updating photo in database:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in replaceOfficialPhoto:", error);
    return false;
  }
}

export async function uploadDocument(petId: string, document: File, type: string): Promise<boolean> {
  try {
    const docPath = `${petId}/docs/${type}-${Date.now()}.${document.name.split('.').pop()}`;
    const docUrl = await uploadFile(document, 'pet_documents', docPath);

    if (!docUrl) {
      throw new Error("Failed to upload document");
    }

    const { error } = await supabase.rpc('handle_document_upload', {
      _pet_id: petId,
      _name: document.name,
      _type: type,
      _file_url: docUrl,
      _size: `${(document.size / 1024).toFixed(2)} KB`
    });

    if (error) {
      console.error("Error creating document record:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    return false;
  }
}
