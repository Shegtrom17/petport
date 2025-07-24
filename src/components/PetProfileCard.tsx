import { useState } from "react";
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
}

interface PetProfileCardProps {
  petData: PetData;
  onUpdate?: () => void;
}

export const PetProfileCard = ({ petData, onUpdate }: PetProfileCardProps) => {
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
    petCaretaker: petData?.petCaretaker || ""
  };

  if (isEditing) {
    return (
      <PetEditForm
        petData={safeEditData}
        onSave={handleEditSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit and Delete Buttons - Only show if user is the owner */}
      {isOwner && (
        <div className="flex justify-end gap-3 mb-4">
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-3 sm:px-6 py-2 text-sm sm:text-base font-medium shadow-lg"
            size="lg"
          >
            <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Edit Profile
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                size="lg"
                className="px-6 py-2 text-base font-medium shadow-lg"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Pet
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {petData?.name || "this pet"}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {petData?.name || "this pet"}'s profile and all associated data including photos, documents, and medical records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePet}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Pet"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Support Animal Status Banner - Commented out since not in pets table */}
      {/* <SupportAnimalBanner status={petData?.supportAnimalStatus || null} /> */}


      {/* Basic Information Card - Moved up for better flow */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <FileText className="w-5 h-5" />
            <span className="tracking-wide">BASIC INFORMATION</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">NAME</p>
              <p className="text-lg font-medium">{petData?.name || "Not specified"}</p>
            </div>
            <div>
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">BREED</p>
              <p className="text-lg font-medium">{petData?.breed || "Not specified"}</p>
            </div>
            <div>
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">AGE</p>
              <p className="text-lg font-medium">{petData?.age || "Not specified"}</p>
            </div>
            <div>
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">WEIGHT</p>
              <p className="text-lg font-medium">{petData?.weight || "Not specified"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">MICROCHIP NUMBER</p>
              <p className="text-lg font-mono bg-slate-700/50 px-3 py-2 rounded border border-yellow-600/30">
                {petData?.microchipId || "Not specified"}
              </p>
            </div>
          </div>
          
          {petData?.bio && (
            <div className="bg-slate-700/30 p-4 rounded-lg border border-yellow-600/30">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide mb-2">BIO</p>
              <p className="text-slate-200">{petData.bio}</p>
            </div>
          )}
          
          <div className="bg-slate-700/30 p-4 rounded-lg border border-yellow-600/30">
            <p className="text-yellow-400 text-sm font-semibold tracking-wide mb-2">BEHAVIORAL NOTES</p>
            <p className="text-slate-200">{petData?.notes || "No notes specified"}</p>
          </div>
        </CardContent>
      </Card>

    {/* Health Information - Navy blue styling - Commented out since not in pets table */}
      {/* <Card className="border-2 border-yellow-600/30 shadow-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gold-500">
            <Calendar className="w-5 h-5" />
            <span className="tracking-wide">HEALTH INFORMATION</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          Health info fields removed - data not in pets table
        </CardContent>
      </Card> */}



      {/* Passport-style Badges - Commented out since not in pets table */}
      {/* <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-yellow-400 tracking-wide">CERTIFIED ACHIEVEMENTS</CardTitle>
        </CardHeader>
        <CardContent>
          Badge info removed - data not in pets table
        </CardContent>
      </Card> */}

      {/* Share Profile Section - Moved to bottom */}
      <SocialShareButtons petName={petData?.name || "Pet"} petId={petData?.id || ""} />
    </div>
  );
};
