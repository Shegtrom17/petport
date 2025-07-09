
import { supabase } from "@/integrations/supabase/client";

export interface CareInstructionsData {
  feedingSchedule?: string;
  morningRoutine?: string;
  eveningRoutine?: string;
  allergies?: string;
  behavioralNotes?: string;
  favoriteActivities?: string;
  medications?: string;
}

export async function updateCareInstructions(
  petId: string,
  data: CareInstructionsData
): Promise<boolean> {
  try {
    console.log("Updating care instructions for pet:", petId, "with data:", data);

    // Update care instructions using the database function
    const { error: careError } = await supabase.rpc('handle_care_instructions_upsert', {
      _pet_id: petId,
      _feeding_schedule: data.feedingSchedule || null,
      _morning_routine: data.morningRoutine || null,
      _evening_routine: data.eveningRoutine || null,
      _allergies: data.allergies || null,
      _behavioral_notes: data.behavioralNotes || null,
      _favorite_activities: data.favoriteActivities || null,
    });

    if (careError) {
      console.error("Error updating care instructions:", careError);
      throw careError;
    }

    // Also update medications in the medical table if provided
    if (data.medications !== undefined) {
      const medicationsArray = data.medications 
        ? data.medications.split(",").map((m: string) => m.trim()).filter(m => m)
        : [];

      const { error: medicalError } = await supabase
        .from("medical")
        .upsert({
          pet_id: petId,
          medications: medicationsArray,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'pet_id'
        });

      if (medicalError) {
        console.error("Error updating medications in medical table:", medicalError);
        throw medicalError;
      }
    }

    console.log("Care instructions updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateCareInstructions:", error);
    return false;
  }
}

export async function fetchCareInstructions(petId: string) {
  try {
    const { data, error } = await supabase
      .from("care_instructions")
      .select("*")
      .eq("pet_id", petId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching care instructions:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchCareInstructions:", error);
    return null;
  }
}
