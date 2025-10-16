import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Phone, FileText, Calendar, Pill, Image, Stethoscope, Clipboard, AlertTriangle, Upload, User, Camera, Edit, Trash2 } from "lucide-react";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { PetEditForm } from "@/components/PetEditForm";
import { PetPDFGenerator } from "@/components/PetPDFGenerator";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PetData {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  sex: string;
  microchipId: string;
  petport_id: string;
  bio: string;
  notes: string;
  state: string;
  county: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Contact information
  vetContact?: string;
  emergencyContact?: string;
  secondEmergencyContact?: string;
  petCaretaker?: string;
  // Medical information
  medicalAlert?: boolean;
  medicalConditions?: string;
  medical_alert?: boolean;
  medical_conditions?: string;
}

interface PetProfileCardProps {
  petData: PetData;
  onUpdate?: () => void;
  togglePetPublicVisibility?: (petId: string, isPublic: boolean) => Promise<boolean>;
  startEditSignal?: number;
}

export const PetProfileCard = ({ petData, onUpdate, togglePetPublicVisibility, startEditSignal }: PetProfileCardProps) => {
  console.log("PetProfileCard - Received petData:", petData);
  
  // Safety check for missing or invalid petData
  if (!petData || !petData.id) {
    console.error("PetProfileCard - petData is missing or invalid:", petData);
    return (
      <Card className="border-2 border-red-500 bg-red-50">
        <CardContent className="p-6">
          <p className="text-center text-red-500 text-lg font-semibold">
            Pet data not available.
          </p>
          <p className="text-center text-red-400 text-sm mt-2">
            Please check your connection and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const editSignalPrevRef = useRef<number>(startEditSignal ?? 0);


  // React to parent edit signal reliably (handles quick first clicks)
  useEffect(() => {
    if (typeof startEditSignal === 'number' && startEditSignal !== editSignalPrevRef.current) {
      editSignalPrevRef.current = startEditSignal;
      console.log('Start edit signal changed, opening edit form');
      setIsEditing(true);
    }
  }, [startEditSignal]);

  const handleUploadMedicalDoc = () => {
    console.log("Opening medical document upload...");
  };

  const handleViewGallery = () => {
    console.log("Switching to gallery view...");
  };

const handleEditSave = () => {
  // Form now handles saving internally, just close edit mode and refresh
  setIsEditing(false);
  if (onUpdate) {
    onUpdate();
  }
};

  const handleDeletePet = async () => {
    if (!user?.id || !petData?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petData.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting pet:', error);
        toast({
          title: "Error",
          description: "Failed to delete pet. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${petData.name} has been deleted successfully.`,
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "Error",
        description: "Failed to delete pet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if current user owns this pet
  const isOwner = user?.id === petData?.user_id;

  // Create safe petData for editing
  const safeEditData: PetData = {
    id: petData?.id || "",
    user_id: petData?.user_id || user?.id || "",
    name: petData?.name || "",
    breed: petData?.breed || "",
    species: petData?.species || "",
    age: petData?.age || "",
    weight: petData?.weight || "",
    sex: petData?.sex || "",
    microchipId: petData?.microchipId || "",
    petport_id: petData?.petport_id || "",
    bio: petData?.bio || "",
    notes: petData?.notes || "",
    state: petData?.state || "",
    county: petData?.county || "",
    is_public: petData?.is_public || false,
    created_at: petData?.created_at || "",
    updated_at: petData?.updated_at || "",
    // Contact information
    vetContact: petData?.vetContact || "",
    emergencyContact: petData?.emergencyContact || "",
    secondEmergencyContact: petData?.secondEmergencyContact || "",
    petCaretaker: petData?.petCaretaker || "",
    // Medical information
    medicalAlert: petData?.medicalAlert ?? petData?.medical_alert ?? false,
    medicalConditions: petData?.medicalConditions ?? petData?.medical_conditions ?? ""
  };

  if (isEditing) {
    return (
      <div id="pet-profile-edit-section" className="space-y-6">
        <PetEditForm
          petData={safeEditData}
          onSave={handleEditSave}
          onCancel={() => setIsEditing(false)}
          togglePetPublicVisibility={togglePetPublicVisibility}
        />
      </div>
    );
  }

  return null;
};
