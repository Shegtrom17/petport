import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Phone, Trash2, Upload, Loader2, Edit, Share2, Facebook, MessageCircle, Mail, Camera } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompactPrivacyToggle } from "@/components/CompactPrivacyToggle";
import { SectionHeader } from "@/components/ui/section-header";
import { GuidanceHint } from "@/components/ui/guidance-hint";


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

  // Transfer dialog state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferLink, setTransferLink] = useState<string>("");

  useEffect(() => {
    const fetchOrgs = async () => {
      if (!transferOpen) return;
      const { data, error } = await supabase.from("organizations").select("id, name");
      if (!error && data) setOrgs(data as any);
    };
    fetchOrgs();
  }, [transferOpen]);
  
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

  // ... rest of the handlers ...

  const handlePhotoUpload = async (type: 'profile' | 'fullBody', file: File) => {
    setPhotoLoading(prev => ({ ...prev, [type]: true }));
    try {
      await replaceOfficialPhoto(enhancedPetData.id, file, type);
      toast({
        title: "Photo uploaded successfully",
        description: `${enhancedPetData.name}'s ${type === 'profile' ? 'profile' : 'full body'} photo has been updated.`,
      });
      onPhotoUpdate?.();
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPhotoLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handlePhotoDelete = async (type: 'profile' | 'fullBody') => {
    try {
      await deleteOfficialPhoto(enhancedPetData.id, type);
      toast({
        title: "Photo deleted",
        description: `${enhancedPetData.name}'s ${type === 'profile' ? 'profile' : 'full body'} photo has been removed.`,
      });
      onPhotoUpdate?.();
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
      const profileUrl = `${window.location.origin}/functions/v1/profile-share?petId=${enhancedPetData.id}&redirect=${encodeURIComponent(`${window.location.origin}/profile/${enhancedPetData.id}`)}`;
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
      
      {/* Basic Information Section - First */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <SectionHeader
            title="Basic Information"
            action={isOwner && (
              <div className="flex items-center space-x-2">
                <div
                  onClick={handleProfileEdit}
                  className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Edit pet profile"
                  onKeyDown={(e) => e.key === 'Enter' && handleProfileEdit()}
                >
                  <Edit className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Edit</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div
                      className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label="Delete pet"
                      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm hidden sm:inline">Delete</span>
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
          />
          
          {/* Show guidance hint for new users when basic info is incomplete */}
          {isOwner && (
            !enhancedPetData?.name || 
            !enhancedPetData?.breed || 
            !enhancedPetData?.age || 
            !enhancedPetData?.weight
          ) && (
            <GuidanceHint
              message="Start by adding your pet's basic information using the Edit button above. This is essential for creating a complete profile."
              actionLabel="Edit Now"
              onAction={handleProfileEdit}
              variant="gentle"
            />
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">NAME</p>
                <p className="text-base font-medium text-foreground">{enhancedPetData?.name || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">BREED</p>
                <p className="text-base font-medium text-foreground">{enhancedPetData?.breed || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">AGE</p>
                <p className="text-base font-medium text-foreground">{enhancedPetData?.age || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">WEIGHT</p>
                <p className="text-base font-medium text-foreground">{enhancedPetData?.weight || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">SEX</p>
                <p className="text-base font-medium text-foreground">{enhancedPetData?.sex ? enhancedPetData.sex.charAt(0).toUpperCase() + enhancedPetData.sex.slice(1) : "Not specified"}</p>
              </div>
              {enhancedPetData?.height && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">HEIGHT</p>
                  <p className="text-base font-medium text-foreground">{enhancedPetData.height}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">MICROCHIP NUMBER</p>
                <p className="text-base font-mono bg-background px-4 py-3 rounded-md border text-foreground">
                  {enhancedPetData?.microchipId || "Not specified"}
                </p>
              </div>
              {enhancedPetData?.registrationNumber && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">REGISTRATION NUMBER</p>
                  <p className="text-base font-mono bg-background px-4 py-3 rounded-md border text-foreground">
                    {enhancedPetData.registrationNumber}
                  </p>
                </div>
              )}
            </div>
            
            {enhancedPetData?.bio && (
              <div className="bg-background p-6 rounded-lg border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">BIO</p>
                <p className="text-foreground leading-relaxed">{enhancedPetData.bio}</p>
              </div>
            )}
            
            <div className="bg-background p-6 rounded-lg border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">DESCRIPTION & UNIQUE TRAITS</p>
              <p className="text-foreground leading-relaxed">{enhancedPetData?.notes || "No description specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Photo Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <SectionHeader
            title="Official Photos"
            icon={<Camera className="w-5 h-5" />}
            action={isOwner && (
              <div className="flex items-center space-x-2">
                {/* Upload from gallery */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload('profile', e.target.files[0])}
                  className="hidden"
                  id="profile-photo-upload"
                />
                <label
                  htmlFor="profile-photo-upload"
                  className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Upload</span>
                </label>
                
                {/* Take photo with camera */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload('profile', e.target.files[0])}
                  className="hidden"
                  id="profile-photo-camera"
                />
                <label
                  htmlFor="profile-photo-camera"
                  className="flex items-center space-x-2 p-3 text-primary hover:text-primary/80 hover:scale-110 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Camera</span>
                </label>
              </div>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {isOwner && enhancedPetData?.photoUrl && (
                <Button
                  onClick={() => handlePhotoDelete('profile')}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">FULL BODY PHOTO</p>
              <div className="relative w-48 h-48 mx-auto">
                {enhancedPetData?.fullBodyPhotoUrl ? (
                  <img
                    src={enhancedPetData.fullBodyPhotoUrl}
                    alt={`${enhancedPetData.name} full body photo`}
                    className="w-full h-full object-cover rounded-lg border-2 border-brand-primary"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg border-2 border-brand-primary flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {photoLoading.fullBody && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                  </div>
                )}
              </div>
              {isOwner && enhancedPetData?.fullBodyPhotoUrl && (
                <Button
                  onClick={() => handlePhotoDelete('fullBody')}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Numbers Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <SectionHeader
            overline="Contacts"
            title="Emergency Contacts"
            icon={<Phone className="w-5 h-5" />}
          />
          
          <div className="space-y-4">
            {enhancedPetData?.emergencyContact && (
              <div className="bg-white p-4 rounded-lg border border-brand-primary">
                <p className="text-brand-primary text-sm font-semibold mb-2">PRIMARY EMERGENCY CONTACT</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(enhancedPetData.emergencyContact);
                  return phoneNumber ? (
                    <a
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-lg font-medium text-brand-primary hover:text-brand-primary-dark underline"
                      aria-label="Call primary emergency contact"
                    >
                      {enhancedPetData.emergencyContact}
                    </a>
                  ) : (
                    <p className="text-lg font-medium text-brand-primary">{enhancedPetData.emergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {enhancedPetData?.secondEmergencyContact && (
              <div className="bg-white p-4 rounded-lg border border-brand-primary">
                <p className="text-brand-primary text-sm font-semibold mb-2">SECONDARY EMERGENCY CONTACT</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(enhancedPetData.secondEmergencyContact);
                  return phoneNumber ? (
                    <a
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-lg font-medium text-brand-primary hover:text-brand-primary-dark underline"
                      aria-label="Call secondary emergency contact"
                    >
                      {enhancedPetData.secondEmergencyContact}
                    </a>
                  ) : (
                    <p className="text-lg font-medium text-brand-primary">{enhancedPetData.secondEmergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {enhancedPetData?.vetContact && (
              <div className="bg-white p-4 rounded-lg border border-brand-primary">
                <p className="text-brand-primary text-sm font-semibold mb-2">VETERINARIAN CONTACT</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(enhancedPetData.vetContact);
                  return phoneNumber ? (
                    <a
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-lg font-medium text-brand-primary hover:text-brand-primary-dark underline"
                      aria-label="Call veterinarian"
                    >
                      {enhancedPetData.vetContact}
                    </a>
                  ) : (
                    <p className="text-lg font-medium text-brand-primary">{enhancedPetData.vetContact}</p>
                  );
                })()}
              </div>
            )}
            
            {!enhancedPetData?.emergencyContact && !enhancedPetData?.secondEmergencyContact && !enhancedPetData?.vetContact && (
              <div className="bg-white p-4 rounded-lg border border-brand-primary text-center">
                <p className="text-brand-primary">No emergency contacts added yet.</p>
                {isOwner && (
                  <Button
                    onClick={handleProfileEdit}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Add Contacts
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <SectionHeader
            overline="Share"
            title="Quick Actions"
            icon={<Share2 className="w-5 h-5" />}
            action={
              isOwner && togglePetPublicVisibility && (
                <CompactPrivacyToggle
                  isPublic={enhancedPetData?.is_public || false}
                  onToggle={(isPublic) => togglePetPublicVisibility(enhancedPetData.id, isPublic)}
                />
              )
            }
          />
          
          {/* Show guidance hint when profile is private and user tries to share */}
          {!enhancedPetData?.is_public && (
            <GuidanceHint
              message="Your pet's profile is currently private. Make it public to enable sharing with others."
              actionLabel="Make Public"
              onAction={() => isOwner && togglePetPublicVisibility && togglePetPublicVisibility(enhancedPetData.id, true)}
              variant="info"
              className="mb-4"
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={enhancedPetData?.is_public ? handleShare : () => isOwner && togglePetPublicVisibility && togglePetPublicVisibility(enhancedPetData.id, true)}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {enhancedPetData?.is_public ? 'Share Profile' : 'Make Public to Share'}
            </Button>
            
            <Button
              onClick={enhancedPetData?.is_public ? () => setIsInAppSharingOpen(true) : () => isOwner && togglePetPublicVisibility && togglePetPublicVisibility(enhancedPetData.id, true)}
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {enhancedPetData?.is_public ? 'In-App Share' : 'Make Public to Share'}
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Generator Section */}
      <div className="mb-8">
        <PetPDFGenerator
          petId={enhancedPetData.id}
          petName={enhancedPetData.name}
          petData={enhancedPetData}
        />
      </div>

    </div>
  );
};
