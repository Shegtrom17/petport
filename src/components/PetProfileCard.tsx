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
  name: string;
  breed: string;
  age: string;
  weight: string;
  microchipId: string;
  petPortId: string;
  petPassId: string;
  photoUrl: string;
  fullBodyPhotoUrl: string;
  vetContact: string;
  emergencyContact: string;
  secondEmergencyContact: string;
  petCaretaker: string;
  lastVaccination: string;
  badges: string[];
  medications: string[];
  notes: string;
  state?: string;
  county?: string;
  species?: string;
  supportAnimalStatus?: string | null;
  medicalAlert: boolean;
  medicalConditions?: string;
  medicalEmergencyDocument?: string | null;
  galleryPhotos?: Array<{ url: string; caption: string; }>;
  user_id?: string;
  bio?: string;
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
  const safeEditData = {
    id: petData?.id || "",
    name: petData?.name || "",
    breed: petData?.breed || "",
    age: petData?.age || "",
    weight: petData?.weight || "",
    microchipId: petData?.microchipId || "",
    species: petData?.species || "",
    state: petData?.state || "",
    county: petData?.county || "",
    notes: petData?.notes || "",
    vetContact: petData?.vetContact || "",
    emergencyContact: petData?.emergencyContact || "",
    secondEmergencyContact: petData?.secondEmergencyContact || "",
    petCaretaker: petData?.petCaretaker || "",
    lastVaccination: petData?.lastVaccination || "",
    medicalConditions: petData?.medicalConditions || "",
    supportAnimalStatus: petData?.supportAnimalStatus || "",
    bio: petData?.bio || "",
    user_id: petData?.user_id || user?.id || ""
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
            className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-6 py-2 text-base font-medium shadow-lg"
            size="lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Pet Profile
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

      {/* Support Animal Status Banner */}
      <SupportAnimalBanner status={petData?.supportAnimalStatus || null} />

      {/* Official Photographs Section - Moved to top for better identification */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-yellow-400">
            <div className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span className="tracking-wide">OFFICIAL PHOTOGRAPHS</span>
            </div>
            <Button 
              onClick={handleViewGallery}
              className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 border border-gold-500/50 shadow-md font-medium"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              View Gallery ({petData?.galleryPhotos?.length || 0})
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PORTRAIT</p>
              <div className="aspect-square rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                <img 
                  src={petData?.photoUrl || "/placeholder.svg"} 
                  alt={`${petData?.name || "Pet"} portrait`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">FULL PROFILE</p>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                <img 
                  src={petData?.fullBodyPhotoUrl || "/placeholder.svg"} 
                  alt={`${petData?.name || "Pet"} full profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

    {/* Health Information - Navy blue styling */}
      <Card className="border-2 border-yellow-600/30 shadow-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gold-500">
            <Calendar className="w-5 h-5" />
            <span className="tracking-wide">HEALTH INFORMATION</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gold-400 text-sm font-medium tracking-wide">Last Vaccination</p>
            <p className="text-lg text-white font-medium">{petData?.lastVaccination || "Not specified"}</p>
          </div>
          
          {/* Medical Alert Section */}
          <div className="border-t border-yellow-600/30 pt-4">

            {petData?.medicalAlert ? (
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
                <p className="text-red-300 font-medium mb-2">Medical Conditions:</p>
                <p className="text-red-200">{petData?.medicalConditions || "No conditions specified"}</p>
                
                <div className="mt-4 flex items-center space-x-2">
                  {petData?.medicalEmergencyDocument ? (
                    <Button size="sm" variant="outline" className="border-red-400 text-red-300 hover:bg-red-900/50">
                      <FileText className="w-4 h-4 mr-2" />
                      View Medical Document
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUploadMedicalDoc}
                      size="sm" 
                      variant="outline" 
                      className="border-red-400 text-red-300 hover:bg-red-900/50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Medical Document
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No medical alerts</p>
            )}
          </div>

          {petData?.medications && petData.medications.length > 0 && (
            <div>
              <p className="text-gold-400 text-sm font-medium tracking-wide mb-2">Current Medications</p>
              <div className="space-y-2">
                {petData.medications.map((medication, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-navy-800/50 p-3 rounded-lg border border-yellow-600/30">
                    <Pill className="w-4 h-4 text-gold-400" />
                    <span className="text-white">{medication}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passport Header - Vet & Microchip Info */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-navy-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full translate-y-12 -translate-x-12"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <CardTitle className="text-yellow-400 text-lg font-bold tracking-wide">VETERINARY CONTACT</CardTitle>
                <p className="text-slate-300 text-sm">Emergency Medical Information</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              PetPort ID: {petData?.petPortId || "Not specified"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PRIMARY VETERINARIAN</p>
              <p className="text-lg font-medium">{petData?.vetContact || "Not specified"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">MICROCHIP NUMBER</p>
              <p className="text-lg font-mono bg-slate-700/50 px-3 py-2 rounded border border-yellow-600/30">
                {petData?.microchipId || "Not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PET CARETAKER</p>
              <p className="text-lg font-medium">{petData?.petCaretaker || "Not specified"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">LOCATION</p>
              <p className="text-lg font-medium">
                {petData?.state && petData?.county ? `${petData.county}, ${petData.state}` : 
                 petData?.state ? petData.state : 
                 petData?.county ? petData.county : 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts - Navy blue styling */}
      <Card className="border-2 border-yellow-600/30 shadow-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gold-500">
            <Phone className="w-5 h-5" />
            <span className="tracking-wide">EMERGENCY CONTACTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gold-400 text-sm font-medium tracking-wide">Primary Emergency Contact</p>
            <p className="text-lg font-medium text-white">{petData?.emergencyContact || "Not specified"}</p>
          </div>
          <div>
            <p className="text-gold-400 text-sm font-medium tracking-wide">Secondary Emergency Contact</p>
            <p className="text-lg font-medium text-white">{petData?.secondEmergencyContact || "Not specified"}</p>
          </div>
        </CardContent>
      </Card>


      {/* Passport-style Badges with New Icons - Moved to after emergency contacts for better flow */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-yellow-400 tracking-wide">CERTIFIED ACHIEVEMENTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {petData?.badges?.slice(0, 4).map((badge, index) => {
              // Different icons for different badge types
              const getIcon = (badgeName: string) => {
                if (badgeName.toLowerCase().includes('therapy') || badgeName.toLowerCase().includes('certified')) return '🏆';
                if (badgeName.toLowerCase().includes('kids') || badgeName.toLowerCase().includes('child')) return '🐾';
                if (badgeName.toLowerCase().includes('trained') || badgeName.toLowerCase().includes('behaved')) return '🦴';
                return '🌍';
              };

              return (
                <div key={index} className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center transform rotate-3 shadow-lg">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {getIcon(badge)}
                      </span>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-2 text-slate-300">{badge}</p>
                </div>
              );
            }) || []}
          </div>
          {petData?.badges && petData.badges.length > 4 && (
            <div className="text-center mt-4">
              <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                +{petData.badges.length - 4} more achievements
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Profile Section - Moved to bottom */}
      <SocialShareButtons petName={petData?.name || "Pet"} petId={petData?.id || ""} />
    </div>
  );
};
