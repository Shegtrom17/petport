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
  state: string | null;
  county: string | null;
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
    state: pet.state,
    county: pet.county,
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
    gallery_photos: pet.gallery_photos || []
  };
}

export async function fetchUserPets(): Promise<any[]> {
  try {
    const { data: pets, error } = await supabase
      .from("pets")
      .select("id, name, breed, species, age, weight, microchip_id, pet_pass_id, bio, notes, state, county, created_at, updated_at, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pets:", error);
      throw error;
    }

    if (!pets || pets.length === 0) {
      return [];
    }

    // Transform the pets data to match component expectations
    return pets.map(pet => {
      // Create a minimal PetWithDetails object for transformation
      const petWithDetails: PetWithDetails = {
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        species: pet.species,
        age: pet.age,
        weight: pet.weight,
        microchip_id: pet.microchip_id,
        pet_pass_id: pet.pet_pass_id,
        bio: pet.bio,
        notes: pet.notes,
        state: pet.state,
        county: pet.county,
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
        documents: []
      };
      return transformPetData(petWithDetails);
    });
  } catch (error) {
    console.error("Error in fetchUserPets:", error);
    return [];
  }
}

export async function fetchPetDetails(petId: string): Promise<any | null> {
  try {
    // First fetch the pet with all required fields
    const { data: pet, error } = await supabase
      .from("pets")
      .select("id, name, breed, species, age, weight, microchip_id, pet_pass_id, bio, notes, state, county, created_at, updated_at, user_id")
      .eq("id", petId)
      .single();

    if (error || !pet) {
      console.error("Error fetching pet:", error);
      return null;
    }

    // Then fetch all related data - using single() instead of maybeSingle() to ensure we get the most recent record
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
      documentsResponse
    ] = await Promise.all([
      supabase.from("contacts").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("medical").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("pet_photos").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("professional_data").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("care_instructions").select("*").eq("pet_id", petId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("gallery_photos").select("*").eq("pet_id", petId),
      supabase.from("experiences").select("*").eq("pet_id", petId),
      supabase.from("achievements").select("*").eq("pet_id", petId),
      supabase.from("training").select("*").eq("pet_id", petId),
      supabase.from("reviews").select("*").eq("pet_id", petId),
      supabase.from("travel_locations").select("*").eq("pet_id", petId),
      supabase.from("documents").select("*").eq("pet_id", petId)
    ]);

    // Log any errors but don't fail the entire operation
    if (contactsResponse.error) console.error("Error fetching contacts:", contactsResponse.error);
    if (medicalResponse.error) console.error("Error fetching medical:", medicalResponse.error);
    if (photosResponse.error) console.error("Error fetching photos:", photosResponse.error);
    if (professionalResponse.error) console.error("Error fetching professional:", professionalResponse.error);
    if (careInstructionsResponse.error) console.error("Error fetching care instructions:", careInstructionsResponse.error);

    // Combine all data into a properly typed PetWithDetails object
    const petWithDetails: PetWithDetails = {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      age: pet.age,
      weight: pet.weight,
      microchip_id: pet.microchip_id,
      pet_pass_id: pet.pet_pass_id,
      bio: pet.bio,
      notes: pet.notes,
      state: pet.state,
      county: pet.county,
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
      documents: documentsResponse.data || []
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

// Update basic pet information
export async function updatePetBasicInfo(petId: string, basicData: {
  notes?: string;
  state?: string;
  county?: string;
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

// Update contact information with improved error handling
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

// Update medical information with improved error handling
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

// Update experience information
export async function updatePetExperience(petId: string, experiences: {
  activity: string;
  contact?: string;
  description?: string;
}[]): Promise<boolean> {
  try {
    // Delete existing experiences
    await supabase
      .from("experiences")
      .delete()
      .eq("pet_id", petId);

    // Insert new experiences
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

// Update achievements information
export async function updatePetAchievements(petId: string, achievements: {
  title: string;
  description?: string;
}[]): Promise<boolean> {
  try {
    // Delete existing achievements
    await supabase
      .from("achievements")
      .delete()
      .eq("pet_id", petId);

    // Insert new achievements
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

// Update training information
export async function updatePetTraining(petId: string, training: {
  course: string;
  facility?: string;
  phone?: string;
  completed?: string;
}[]): Promise<boolean> {
  try {
    // Delete existing training
    await supabase
      .from("training")
      .delete()
      .eq("pet_id", petId);

    // Insert new training
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

// Update reviews information
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
    // Delete existing reviews
    await supabase
      .from("reviews")
      .delete()
      .eq("pet_id", petId);

    // Insert new reviews
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

// Update travel locations with improved error handling
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
    
    // Delete existing travel locations
    const { error: deleteError } = await supabase
      .from("travel_locations")
      .delete()
      .eq("pet_id", petId);

    if (deleteError) {
      console.error("Error deleting existing travel locations:", deleteError);
      throw deleteError;
    }

    // Insert new travel locations
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

// Update professional data with improved error handling and parameter mapping fix
export async function updateProfessionalData(petId: string, data: {
  badges?: string[];
  supportAnimalStatus?: string;
}): Promise<boolean> {
  try {
    console.log("Updating professional data for pet:", petId, "with data:", data);
    
    // Map supportAnimalStatus to support_animal_status for database
    const dbData = {
      pet_id: petId,
      badges: data.badges,
      support_animal_status: data.supportAnimalStatus, // Fixed parameter mapping
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

// Upload file to storage
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

// Upload pet photos
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

    // Call the database function to update photos
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

// Upload gallery photo
export async function uploadGalleryPhoto(petId: string, photo: File, caption?: string): Promise<boolean> {
  try {
    const photoPath = `${petId}/gallery-${Date.now()}.${photo.name.split('.').pop()}`;
    const photoUrl = await uploadFile(photo, 'pet_photos', photoPath);

    if (!photoUrl) {
      throw new Error("Failed to upload photo");
    }

    // Call the database function to create gallery photo record
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

// Upload document
export async function uploadDocument(petId: string, document: File, type: string): Promise<boolean> {
  try {
    const docPath = `${petId}/docs/${type}-${Date.now()}.${document.name.split('.').pop()}`;
    const docUrl = await uploadFile(document, 'pet_documents', docPath);

    if (!docUrl) {
      throw new Error("Failed to upload document");
    }

    // Call the database function to create document record
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
