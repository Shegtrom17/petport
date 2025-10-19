import { useState, useEffect } from "react";
import { PetEditForm } from "@/components/PetEditForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertTriangle, Phone, Trash2, Upload, Loader2, Edit, Share2, Facebook, MessageCircle, Mail, Camera, Info } from "lucide-react";
import { PetDeleteDialog } from "@/components/PetDeleteDialog";
import { PetPDFGenerator } from "@/components/PetPDFGenerator";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { ProfileEditButton } from "@/components/ProfileEditButton";
import { CertificationBanner } from "@/components/CertificationBanner";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { PrivacyHint } from "@/components/PrivacyHint";
import { deleteOfficialPhoto, replaceOfficialPhoto } from "@/services/petService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { shareProfileOptimized } from "@/services/pdfService";
import { generateShareURL } from "@/utils/domainUtils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompactPrivacyToggle } from "@/components/CompactPrivacyToggle";
import { SectionHeader } from "@/components/ui/section-header";
import { GuidanceHint } from "@/components/ui/guidance-hint";
import { QuickShareHub } from "@/components/QuickShareHub";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { compressMultipleImages } from "@/utils/imageCompression";


interface PetProfileContentProps {
  petData: any;
  selectedPet: any;
  setActiveTab: (tab: string) => void;
  setIsInAppSharingOpen: (open: boolean) => void;
  onPhotoUpdate?: () => void;
  onEditClick?: () => void;
  togglePetPublicVisibility?: (petId: string, isPublic: boolean) => Promise<boolean>;
  handlePetUpdate?: () => Promise<void>;
}

export const PetProfileContent = ({
  petData, 
  selectedPet, 
  setActiveTab, 
  setIsInAppSharingOpen,
  onPhotoUpdate,
  onEditClick,
  togglePetPublicVisibility,
  handlePetUpdate 
}: PetProfileContentProps) => {
  console.log("PetProfileContent - Received petData:", petData);
  console.log("PetProfileContent - Received selectedPet:", selectedPet);
  
  const [photoLoading, setPhotoLoading] = useState<{ profile: boolean; fullBody: boolean }>({
    profile: false,
    fullBody: false
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contactsRefreshKey, setContactsRefreshKey] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Safety check for missing data
  if (!petData) {
    console.error("PetProfileContent - petData is missing");
    return (
      <Card className="border-2 border-red-500 bg-red-50">
        <CardContent className="p-6">
          <p className="text-center text-red-500 text-lg font-semibold">
            Pet profile data not available.
          </p>
          <p className="text-center text-red-400 text-sm mt-2">
            Please check your connection and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const enhancedPetData = {
    ...petData,
    user_id: selectedPet?.user_id || petData.user_id
  };

  // Debug logging for lost pet status
  console.log('PetProfileContent - enhancedPetData:', enhancedPetData);
  console.log('PetProfileContent - enhancedPetData.is_lost:', enhancedPetData.is_lost);
  console.log('PetProfileContent - enhancedPetData.lost_pet_data:', enhancedPetData.lost_pet_data);

  // Check if current user owns this pet
  const isOwner = user?.id === enhancedPetData?.user_id;

  const handleProfileEdit = () => {
    console.log("Edit Profile button clicked - starting edit process");
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    await handlePetUpdate?.();
    setIsEditing(false);
    
    // Add delay to ensure database write completes before refresh (iOS Safari timing issue)
    setTimeout(() => {
      setContactsRefreshKey((k) => k + 1);
    }, 300);
    
    toast({
      title: "Success",
      description: "Pet profile updated successfully!",
    });
  };
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDeletePet = async () => {
    if (!user?.id || !enhancedPetData?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', enhancedPetData.id)
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
          description: `${enhancedPetData.name} has been deleted successfully.`,
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

  // ... rest of the handlers ...

  const handlePhotoUpload = async (type: 'profile' | 'fullBody', file: File) => {
    setPhotoLoading(prev => ({ ...prev, [type]: true }));
    try {
      console.log("START_UPLOAD_PROFILE:", { type, fileName: file.name, fileSize: file.size });
      
      // Check file size before processing
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error("File size too large. Please choose a smaller image.");
      }
      
      // Pre-compress image (same as gallery for consistency)
      const compressionResults = await compressMultipleImages([file], {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        maxSizeKB: 800
      });
      
      const compressedFile = compressionResults[0].file;
      console.log("COMPRESS_OK:", { 
        originalSize: file.size, 
        compressedSize: compressedFile.size,
        compressionRatio: compressionResults[0].compressionRatio 
      });
      
      await replaceOfficialPhoto(enhancedPetData.id, compressedFile, type);
      console.log("STORAGE_UPLOAD_OK:", { type });
      
      toast({
        title: "Photo uploaded successfully",
        description: `${enhancedPetData.name}'s ${type === 'profile' ? 'profile' : 'full body'} photo has been updated.`,
      });
      
      // Refresh data for PDFs/links
      onPhotoUpdate?.();
      if (handlePetUpdate) {
        await handlePetUpdate();
        console.log("DB_UPDATE_OK: Pet data refreshed for PDFs/links");
      }
    } catch (error) {
      console.error('UPLOAD_ERROR:', { type, error: error instanceof Error ? error.message : error });
      
      let errorMessage = "Failed to upload photo. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Failed to convert HEIC")) {
          errorMessage = "HEIC files need conversion. Please use your camera's 'Most Compatible' setting (JPEG) or convert to JPG/PNG.";
        } else if (error.message.includes("size too large")) {
          errorMessage = "Image file is too large. Please choose a smaller image.";
        } else if (error.message.includes("session has expired") || error.message.includes("Authentication required")) {
          errorMessage = "Your session has expired. Please refresh the page and try again.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("format") || error.message.includes("type")) {
          errorMessage = "Invalid file format. Please choose a JPG, PNG, or WEBP image.";
        } else if (error.message.includes("compression failed")) {
          errorMessage = "Failed to process image. Please try a different photo or convert to JPG format.";
        }
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPhotoLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const openProfileFilePicker = (type: 'profile' | 'fullBody', useCamera: boolean) => {
    console.log("OPENING_FILE_PICKER:", { type, useCamera });
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) {
      input.capture = 'environment';
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("FILE_SELECTED:", { fileName: file.name, fileSize: file.size });
        handlePhotoUpload(type, file);
      }
    };
    
    input.click();
  };

  const handlePhotoDelete = async (type: 'profile' | 'fullBody') => {
    try {
      await deleteOfficialPhoto(enhancedPetData.id, type);
      toast({
        title: "Photo deleted",
        description: `${enhancedPetData.name}'s ${type === 'profile' ? 'profile' : 'full body'} photo has been removed.`,
      });
    } catch (error) {
      console.error('Photo delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      // Use the edge function URL for better social media previews
      const redirectUrl = `${window.location.origin}/profile/${enhancedPetData.id}`;
      const profileUrl = generateShareURL('profile-share', enhancedPetData.id, redirectUrl);
      const result = await shareProfileOptimized(profileUrl, enhancedPetData.name, 'profile');
      
      if (result.success) {
        toast({
          title: result.shared ? "Profile Shared!" : "Link Copied!",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to share profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="passport-map-container">
      <div className="passport-map-bg" />
      
      {/* Profile Management Hub */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <Card className="bg-white shadow-xl transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Edit className="w-6 h-6 text-[#5691af]" />
                Profile Management Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="transition-all duration-300 ease-in-out">
              {!isEditing ? (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    Manage your pet's profile specific info, bio, contacts, medical alerts, privacy settings, and <span className="text-orange-700 font-semibold">foster-to-adopter transfer options</span>.
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-4">
                    {/* Update Profile Photo Button */}
                    {isOwner && (
                      <Button
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="bg-[#5691af] hover:bg-[#4a7d99] text-white w-full flex items-center justify-center gap-2 h-12"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Update Profile Photo</span>
                      </Button>
                    )}
                    
                    {/* Edit Profile Button */}
                    {isOwner && (
                      <Button
                        onClick={handleProfileEdit}
                        className="bg-[#5691af] hover:bg-[#4a7d99] text-white w-full flex items-center justify-center gap-2 h-12"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Pet Profile</span>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <PetEditForm
                    petData={enhancedPetData}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                    togglePetPublicVisibility={togglePetPublicVisibility}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Quick Share Hub Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <QuickShareHub
            petData={enhancedPetData}
            isLost={enhancedPetData.is_lost || enhancedPetData.lost_pet_data?.is_missing || false}
            handlePetUpdate={handlePetUpdate}
          />
        </div>
      </div>

      {/* Contacts Display Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <ContactsDisplay petId={enhancedPetData?.id} fallbackPetData={enhancedPetData} refreshKey={contactsRefreshKey} />
        </div>
      </div>

      {/* PDF Generator Section - HIDDEN: Migrated to Quick Share Hub */}
      {false && (
        <div className="mb-8">
          <PetPDFGenerator
            petId={enhancedPetData.id}
            petName={enhancedPetData.name}
            petData={enhancedPetData}
            handlePetUpdate={handlePetUpdate}
          />
        </div>
      )}

      {/* Photo Update Modal */}
      <Sheet open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Profile Photo</SheetTitle>
          </SheetHeader>
          
          {/* Photo Preview Section */}
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
              {enhancedPetData?.photoUrl ? (
                <img 
                  src={enhancedPetData.photoUrl} 
                  alt={enhancedPetData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {photoLoading.profile && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {enhancedPetData?.photoUrl ? 'Current profile photo' : 'No photo uploaded'}
            </p>
          </div>
          
          <div className="space-y-3 mt-6">
            {/* Upload from Gallery */}
            <Button
              onClick={() => {
                openProfileFilePicker('profile', false);
                setIsPhotoModalOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 h-12 bg-[#5691af] hover:bg-[#4a7d99] text-white"
            >
              <Upload className="w-5 h-5" />
              <span>Upload from Gallery</span>
            </Button>
            
            {/* Take Photo */}
            <Button
              onClick={() => {
                openProfileFilePicker('profile', true);
                setIsPhotoModalOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 h-12 bg-[#5691af] hover:bg-[#4a7d99] text-white"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </Button>
            
            {/* Delete Photo (only if photo exists) */}
            {enhancedPetData?.photoUrl && (
              <Button
                onClick={() => {
                  handlePhotoDelete('profile');
                  setIsPhotoModalOpen(false);
                }}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12 text-red-600 border-red-300 hover:border-red-500"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Photo</span>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};
