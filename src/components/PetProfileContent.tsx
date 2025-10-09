import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  
  // More flexible regex to match various phone formats
  const phoneMatch = contactString.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) {
    return phoneMatch[0].replace(/[^\d]/g, ''); // Remove non-digit characters
  }
  return null;
};

const formatPhoneForTel = (phone: string) => {
  return `+1${phone}`; // Assuming US numbers, adjust as needed
};

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
    
    // Trigger parent component to switch to edit mode
    if (onEditClick) {
      console.log("Calling onEditClick to trigger edit mode");
      onEditClick(); // This should trigger the parent to handle edit mode
    }
    
    // Smooth scroll to the edit section after a brief delay to ensure form renders
    setTimeout(() => {
      const editSection = document.getElementById('pet-profile-edit-section');
      console.log("Looking for edit section element:", editSection);
      
      if (editSection) {
        console.log("Found edit section, scrolling to it");
        editSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        console.error("Edit section not found! ID 'pet-profile-edit-section' does not exist in DOM");
      }
    }, 200); // Increased delay slightly
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
      
      {/* Profile Photo Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <SectionHeader
            title="Profile Photo"
            icon={<Camera className="w-5 h-5" />}
            action={isOwner && (
              <div className="flex items-center space-x-2">
                {/* Upload from gallery */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openProfileFilePicker('profile', false)}
                  className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Upload</span>
                </Button>
                
                {/* Take photo with camera */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openProfileFilePicker('profile', true)}
                  className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Camera</span>
                </Button>
              </div>
            )}
          />
          
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">PROFILE PHOTO</p>
              <div className="relative w-48 h-48 mx-auto">
                {enhancedPetData?.photoUrl ? (
                  <img
                    src={enhancedPetData.photoUrl}
                    alt={`${enhancedPetData.name} profile photo`}
                    className="w-full h-full object-cover rounded-lg border-2 border-brand-primary"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg border-2 border-brand-primary flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {photoLoading.profile && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                  </div>
                )}
              </div>
              {isOwner && (
                <div className="mt-3 flex justify-center space-x-2">
                  {/* Upload from gallery */}
                  <Button
                    onClick={() => openProfileFilePicker('profile', false)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Button>
                  
                  {/* Take photo with camera */}
                  <Button
                    onClick={() => openProfileFilePicker('profile', true)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </Button>
                  
                  {enhancedPetData?.photoUrl && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handlePhotoDelete('profile');
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:border-red-500 hover:text-red-700 hover:scale-105 transition-all touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Management Hub - Streamlined */}
      <div className="mb-8">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Edit className="w-6 h-6 text-[#5691af]" />
              Profile Management Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Manage your pet's profile, photos, documents, and privacy settings
            </p>

            {/* Guidance hint for incomplete profiles */}
            {isOwner && (
              !enhancedPetData?.name || 
              !enhancedPetData?.breed || 
              !enhancedPetData?.age || 
              !enhancedPetData?.weight
            ) && (
              <GuidanceHint
                message="Complete your pet's profile for professional PDFs and comprehensive sharing"
                actionLabel="Edit Pet Profile"
                onAction={handleProfileEdit}
                variant="gentle"
              />
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mb-4">
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

            {/* Privacy Toggle in Button Style */}
              {isOwner && togglePetPublicVisibility && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">Privacy</span>
                  <CompactPrivacyToggle
                    isPublic={enhancedPetData?.is_public || false}
                    onToggle={(isPublic) => togglePetPublicVisibility(enhancedPetData.id, isPublic)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Contacts Display Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <ContactsDisplay petId={enhancedPetData?.id} />
        </div>
      </div>

      {/* Quick Share Hub Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <QuickShareHub
            petData={{
              id: enhancedPetData.id,
              name: enhancedPetData.name
            }}
            isLost={enhancedPetData.is_lost || enhancedPetData.lost_pet_data?.is_missing || false}
          />
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Share different views of profile
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong>General Profile:</strong> Complete profile with all sections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong>Emergency Profile:</strong> Critical info for urgent situations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong>Missing Pet Alert:</strong> Specialized format for lost pet reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span><strong>Photo Gallery:</strong> Just the photos for easy viewing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Generator Section */}
      <div className="mb-8">
        <PetPDFGenerator
          petId={enhancedPetData.id}
          petName={enhancedPetData.name}
          petData={enhancedPetData}
          handlePetUpdate={handlePetUpdate}
        />
      </div>


    </div>
  );
};
