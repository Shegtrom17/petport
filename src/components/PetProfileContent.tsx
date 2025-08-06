
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Phone, Trash2, Upload, Loader2, Edit, Share2 } from "lucide-react";
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

interface PetProfileContentProps {
  petData: any;
  selectedPet: any;
  setActiveTab: (tab: string) => void;
  setIsInAppSharingOpen: (open: boolean) => void;
  onPhotoUpdate?: () => void;
  onEditClick?: () => void;
  togglePetPublicVisibility?: (petId: string, isPublic: boolean) => Promise<boolean>;
}

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  
  // Extract phone number using regex - supports various formats
  const phoneMatch = contactString.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
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
  togglePetPublicVisibility 
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

  const handleDeletePhoto = async (photoType: 'profile' | 'fullBody') => {
    if (!selectedPet?.id && !enhancedPetData?.id) {
      toast({
        title: "Error",
        description: "Pet ID not found",
        variant: "destructive"
      });
      return;
    }

    const petId = selectedPet?.id || enhancedPetData.id;
    setPhotoLoading(prev => ({ ...prev, [photoType]: true }));

    try {
      const success = await deleteOfficialPhoto(petId, photoType);
      if (success) {
        toast({
          title: "Success",
          description: `${photoType === 'profile' ? 'Portrait' : 'Full profile'} photo deleted successfully`
        });
        onPhotoUpdate?.();
      } else {
        throw new Error("Failed to delete photo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${photoType === 'profile' ? 'portrait' : 'full profile'} photo`,
        variant: "destructive"
      });
    } finally {
      setPhotoLoading(prev => ({ ...prev, [photoType]: false }));
    }
  };

  const handleUploadPhoto = (photoType: 'profile' | 'fullBody') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!selectedPet?.id && !enhancedPetData?.id) {
        toast({
          title: "Error",
          description: "Pet ID not found",
          variant: "destructive"
        });
        return;
      }

      const petId = selectedPet?.id || enhancedPetData.id;
      setPhotoLoading(prev => ({ ...prev, [photoType]: true }));

      try {
        const success = await replaceOfficialPhoto(petId, file, photoType);
        if (success) {
          toast({
            title: "Success",
            description: `${photoType === 'profile' ? 'Portrait' : 'Full profile'} photo updated successfully`
          });
          onPhotoUpdate?.();
        } else {
          throw new Error("Failed to upload photo");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${photoType === 'profile' ? 'portrait' : 'full profile'} photo`,
          variant: "destructive"
        });
      } finally {
        setPhotoLoading(prev => ({ ...prev, [photoType]: false }));
      }
    };
    input.click();
  };

  return (
    <div className="passport-map-container">
      <div className="passport-map-bg" />
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Official Photographs */}
        <div className="space-y-4">
          <Card className="border-2 border-gold-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gold-400">
                <div className="flex items-center space-x-2">
                  <span className="tracking-wide">OFFICIAL PHOTOGRAPHS</span>
                </div>
                <Button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 border border-gold-500/50 shadow-md font-medium text-xs px-1.5 py-0.5"
                  size="sm"
                >
                  Gallery
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gold-400 text-sm font-semibold tracking-wide">PORTRAIT</p>
                    <div className="flex gap-2">
                      <div
                        onClick={() => handleUploadPhoto('profile')}
                        className="p-1 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                        role="button"
                        tabIndex={0}
                        aria-label="Upload portrait photo"
                        onKeyDown={(e) => e.key === 'Enter' && handleUploadPhoto('profile')}
                      >
                        {photoLoading.profile ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                      </div>
                      {enhancedPetData?.photoUrl && enhancedPetData.photoUrl !== "/placeholder.svg" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div
                              className="p-1 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                              role="button"
                              tabIndex={0}
                              aria-label="Delete portrait photo"
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                            >
                              <Trash2 className="w-3 h-3" />
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Portrait Photo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The portrait photo will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePhoto('profile')}
                                className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden border-4 border-gold-600/50 shadow-lg relative">
                    <img 
                      src={enhancedPetData?.photoUrl || "/placeholder.svg"} 
                      alt={`${enhancedPetData?.name || "Pet"} portrait`}
                      className="w-full h-full object-cover"
                    />
                    {photoLoading.profile && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gold-400 text-sm font-semibold tracking-wide">FULL PROFILE</p>
                    <div className="flex gap-2">
                      <div
                        onClick={() => handleUploadPhoto('fullBody')}
                        className="p-1 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                        role="button"
                        tabIndex={0}
                        aria-label="Upload full body photo"
                        onKeyDown={(e) => e.key === 'Enter' && handleUploadPhoto('fullBody')}
                      >
                        {photoLoading.fullBody ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                      </div>
                      {enhancedPetData?.fullBodyPhotoUrl && enhancedPetData.fullBodyPhotoUrl !== "/placeholder.svg" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div
                              className="p-1 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                              role="button"
                              tabIndex={0}
                              aria-label="Delete full body photo"
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                            >
                              <Trash2 className="w-3 h-3" />
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Full Profile Photo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The full profile photo will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePhoto('fullBody')}
                                className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-4 border-gold-600/50 shadow-lg relative">
                    <img 
                      src={enhancedPetData?.fullBodyPhotoUrl || "/placeholder.svg"} 
                      alt={`${enhancedPetData?.name || "Pet"} full profile`}
                      className="w-full h-full object-cover"
                    />
                    {photoLoading.fullBody && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Alert Banner - Moved to left column */}
          {enhancedPetData?.medicalAlert && (
            <Card className="border-2 border-red-600 shadow-xl bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-red-400"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-care'))}>
              <div className="absolute inset-0 bg-black/10"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                  <div className="text-center">
                    <h3 className="text-xl font-bold tracking-wide">MEDICAL ALERT</h3>
                    <p className="text-red-100 text-sm">{enhancedPetData?.medicalConditions || "Medical conditions specified"}</p>
                    <div className="mt-2 pt-2 border-t border-red-400/50">
                      <p className="text-red-200 text-xs font-medium">
                        👆 Click to view full medical details
                      </p>
                    </div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certification Banner - Compact display */}
          <CertificationBanner certificationData={enhancedPetData?.certificationData} />

          {/* Basic Information Section */}
          <Card className="border-2 border-gold-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gold-400">
                <div className="flex items-center space-x-2">
                  <span className="tracking-wide text-sm">BASIC INFO</span>
                </div>
                {isOwner && (
                  <div className="flex items-center space-x-2">
                    <div
                      onClick={handleProfileEdit}
                      className="flex items-center space-x-1 p-2 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label="Edit pet profile"
                      onKeyDown={(e) => e.key === 'Enter' && handleProfileEdit()}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-xs hidden sm:inline">Edit</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div
                          className="flex items-center space-x-1 p-2 text-gold-400 hover:text-gold-300 hover:scale-110 transition-all cursor-pointer"
                          role="button"
                          tabIndex={0}
                          aria-label="Delete pet"
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">Delete</span>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {enhancedPetData?.name || "this pet"}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {enhancedPetData?.name || "this pet"}'s profile and all associated data including photos, documents, and medical records.
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gold-400 text-sm font-semibold tracking-wide">NAME</p>
                  <p className="text-lg font-medium">{enhancedPetData?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold tracking-wide">BREED</p>
                  <p className="text-lg font-medium">{enhancedPetData?.breed || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold tracking-wide">AGE</p>
                  <p className="text-lg font-medium">{enhancedPetData?.age || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gold-400 text-sm font-semibold tracking-wide">WEIGHT</p>
                  <p className="text-lg font-medium">{enhancedPetData?.weight || "Not specified"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide">MICROCHIP NUMBER</p>
                  <p className="text-lg font-mono bg-slate-700/50 px-3 py-2 rounded border border-gold-600/30">
                    {enhancedPetData?.microchipId || "Not specified"}
                  </p>
                </div>
              </div>
              
              {enhancedPetData?.bio && (
                <div className="bg-slate-700/30 p-4 rounded-lg border border-gold-600/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-2">BIO</p>
                  <p className="text-slate-200">{enhancedPetData.bio}</p>
                </div>
              )}
              
              <div className="bg-slate-700/30 p-4 rounded-lg border border-gold-600/30">
                <p className="text-gold-400 text-sm font-semibold tracking-wide mb-2">BEHAVIORAL NOTES</p>
                <p className="text-slate-200">{enhancedPetData?.notes || "No notes specified"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Action-First Flow */}
        <div className="space-y-4">
          {/* 1. QUICK ACTIONS - Immediate actions available */}
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-navy-900 border-b-2 border-gold-500 pb-2 flex items-center justify-between">
                <span>⚡ QUICK ACTIONS</span>
                <PrivacyHint isPublic={enhancedPetData?.is_public || false} feature="" variant="badge" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Privacy Toggle removed - now in PetPassportCard */}
              
              {/* Privacy hint for sharing features when profile is private */}
              {!enhancedPetData?.is_public && (
                <PrivacyHint 
                  isPublic={enhancedPetData?.is_public || false} 
                  feature="sharing and QR code features" 
                  variant="banner"
                  showToggle={isOwner}
                  onTogglePrivacy={isOwner && togglePetPublicVisibility ? () => togglePetPublicVisibility(enhancedPetData.id, true) : undefined}
                />
              )}
              
              <div className="space-y-1">
                <div 
                  onClick={() => setActiveTab("documents")}
                  className="w-full cursor-pointer flex items-center justify-center text-navy-900 hover:text-gold-600 hover:scale-110 transition-all duration-200 py-2"
                >
                  📄 Manage Documents
                </div>
                <div 
                  onClick={() => setActiveTab("quickid")}
                  className="w-full cursor-pointer flex items-center justify-center text-navy-900 hover:text-gold-600 hover:scale-110 transition-all duration-200 py-2"
                >
                  🆔 Lost Pet
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div 
                      className="w-full cursor-pointer flex items-center justify-center text-navy-900 hover:text-gold-600 hover:scale-110 transition-all duration-200 py-2"
                      role="button"
                      tabIndex={0}
                      aria-label="Share profile"
                    >
                      📱 Share Profile
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs w-[95vw] p-4">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-center">Share {enhancedPetData?.name}'s Profile</h3>
                      
                      <Button
                        onClick={async () => {
                          const shareUrl = `${window.location.origin}/profile/${enhancedPetData?.id}`;
                          try {
                            if (navigator.share) {
                              await navigator.share({
                                title: `${enhancedPetData?.name}'s PetPort Profile`,
                                text: `Meet ${enhancedPetData?.name}! Check out their PetPort profile.`,
                                url: shareUrl,
                              });
                            } else {
                              await navigator.clipboard.writeText(shareUrl);
                              alert('Link copied to clipboard!');
                            }
                          } catch (err) {
                            console.error('Share failed:', err);
                          }
                        }}
                        className="w-full"
                      >
                        📱 Quick Share
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          const shareUrl = `${window.location.origin}/profile/${enhancedPetData?.id}`;
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard!');
                          } catch (err) {
                            console.error('Copy failed:', err);
                          }
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        📋 Copy Link
                      </Button>
                      
                      <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                        {`${window.location.origin}/profile/${enhancedPetData?.id}`}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {!enhancedPetData?.is_public && (
                  <PrivacyHint isPublic={enhancedPetData?.is_public || false} feature="profile sharing" variant="inline" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. PASSPORT DOCUMENTS - Most important action */}
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
                🛂 PETPORT QUICK PDF'S
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PetPDFGenerator 
                petId={petData?.id || ""} 
                petName={petData?.name || "Pet"} 
                petData={petData}
              />
            </CardContent>
          </Card>

          {/* 3. CONTACT & IDENTIFICATION - Reference information */}
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
                📋 CONTACT & IDENTIFICATION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enhancedPetData?.emergencyContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">PRIMARY EMERGENCY CONTACT</p>
                  {(() => {
                    const phoneNumber = extractPhoneNumber(enhancedPetData.emergencyContact);
                    return phoneNumber ? (
                      <a 
                        href={`tel:${formatPhoneForTel(phoneNumber)}`}
                        className="font-medium flex items-center gap-2 hover:text-gold-300 transition-colors duration-200 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        {enhancedPetData.emergencyContact}
                      </a>
                    ) : (
                      <p className="font-medium">{enhancedPetData.emergencyContact}</p>
                    );
                  })()}
                </div>
              )}
              
              {enhancedPetData?.secondEmergencyContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">SECONDARY EMERGENCY CONTACT</p>
                  {(() => {
                    const phoneNumber = extractPhoneNumber(enhancedPetData.secondEmergencyContact);
                    return phoneNumber ? (
                      <a 
                        href={`tel:${formatPhoneForTel(phoneNumber)}`}
                        className="font-medium flex items-center gap-2 hover:text-gold-300 transition-colors duration-200 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        {enhancedPetData.secondEmergencyContact}
                      </a>
                    ) : (
                      <p className="font-medium">{enhancedPetData.secondEmergencyContact}</p>
                    );
                  })()}
                </div>
              )}
              
              {enhancedPetData?.vetContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">VETERINARIAN CONTACT</p>
                  {(() => {
                    const phoneNumber = extractPhoneNumber(enhancedPetData.vetContact);
                    return phoneNumber ? (
                      <a 
                        href={`tel:${formatPhoneForTel(phoneNumber)}`}
                        className="font-medium flex items-center gap-2 hover:text-gold-300 transition-colors duration-200 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        {enhancedPetData.vetContact}
                      </a>
                    ) : (
                      <p className="font-medium">{enhancedPetData.vetContact}</p>
                    );
                  })()}
                </div>
              )}
              
              {enhancedPetData?.petCaretaker && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">PET CARETAKER</p>
                  {(() => {
                    const phoneNumber = extractPhoneNumber(enhancedPetData.petCaretaker);
                    return phoneNumber ? (
                      <a 
                        href={`tel:${formatPhoneForTel(phoneNumber)}`}
                        className="font-medium flex items-center gap-2 hover:text-gold-300 transition-colors duration-200 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        {enhancedPetData.petCaretaker}
                      </a>
                    ) : (
                      <p className="font-medium">{enhancedPetData.petCaretaker}</p>
                    );
                  })()}
                </div>
              )}
              
              {(enhancedPetData?.county || enhancedPetData?.state) && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">LOCATION</p>
                  <p className="font-medium">
                    {enhancedPetData.county && `${enhancedPetData.county} County`}
                    {enhancedPetData.county && enhancedPetData.state && ', '}
                    {enhancedPetData.state}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
