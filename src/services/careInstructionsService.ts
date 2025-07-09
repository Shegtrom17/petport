
import { supabase } from "@/integrations/supabase/client";

export interface CareInstructionsData {
  feeding_schedule?: string;
  morning_routine?: string;
  evening_routine?: string;
  allergies?: string;
  behavioral_notes?: string;
  favorite_activities?: string;
}

export async function saveCareInstructions(petId: string, data: CareInstructionsData): Promise<boolean> {
  try {
    console.log("Saving care instructions for pet:", petId, data);
    
    const { error } = await supabase.rpc('handle_care_instructions_upsert', {
      _pet_id: petId,
      _feeding_schedule: data.feeding_schedule || null,
      _morning_routine: data.morning_routine || null,
      _evening_routine: data.evening_routine || null,
      _allergies: data.allergies || null,
      _behavioral_notes: data.behavioral_notes || null,
      _favorite_activities: data.favorite_activities || null
    });

    if (error) {
      console.error("Error saving care instructions:", error);
      throw error;
    }

    console.log("Care instructions saved successfully!");
    return true;
  } catch (error) {
    console.error("Error in saveCareInstructions:", error);
    return false;
  }
}

export async function fetchCareInstructions(petId: string): Promise<CareInstructionsData | null> {
  try {
    const { data, error } = await supabase
      .from("care_instructions")
      .select("*")
      .eq("pet_id", petId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching care instructions:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      feeding_schedule: data.feeding_schedule || "",
      morning_routine: data.morning_routine || "",
      evening_routine: data.evening_routine || "",
      allergies: data.allergies || "",
      behavioral_notes: data.behavioral_notes || "",
      favorite_activities: data.favorite_activities || ""
    };
  } catch (error) {
    console.error("Error in fetchCareInstructions:", error);
    return null;
  }
}
