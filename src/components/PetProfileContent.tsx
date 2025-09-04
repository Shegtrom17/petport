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
  const phoneMatch = contactString.match(/\(\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    return phoneMatch[0].replace(/[^\\d]/g, ''); // Remove non-digit characters
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

  return (
    <div className="passport-map-container">
      <div className="passport-map-bg" />
      
      {/* Basic Information Section - Full Width at Top */}
      <div className="mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-brand-primary mb-6">
            <div className="flex items-center space-x-2">
              <span className="tracking-wide text-sm font-semibold">BASIC INFO</span>
            </div>
            {isOwner && (
              <div className="flex items-center space-x-2">
                <div
                  onClick={handleProfileEdit}
                  className="flex items-center space-x-2 p-3 text-brand-primary hover:text-brand-primary-dark hover:scale-110 transition-all cursor-pointer"
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
                      className="flex items-center space-x-2 p-3 text-brand-primary hover:text-brand-primary-dark hover:scale-110 transition-all cursor-pointer"
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
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">NAME</p>
                <p className="text-lg font-medium text-brand-primary">{enhancedPetData?.name || "Not specified"}</p>
              </div>
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">BREED</p>
                <p className="text-lg font-medium text-brand-primary">{enhancedPetData?.breed || "Not specified"}</p>
              </div>
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">AGE</p>
                <p className="text-lg font-medium text-brand-primary">{enhancedPetData?.age || "Not specified"}</p>
              </div>
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">WEIGHT</p>
                <p className="text-lg font-medium text-brand-primary">{enhancedPetData?.weight || "Not specified"}</p>
              </div>
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">SEX</p>
                <p className="text-lg font-medium text-brand-primary">{enhancedPetData?.sex ? enhancedPetData.sex.charAt(0).toUpperCase() + enhancedPetData.sex.slice(1) : "Not specified"}</p>
              </div>
              {enhancedPetData?.height && (
                <div>
                  <p className="text-brand-primary text-sm font-semibold tracking-wide">HEIGHT</p>
                  <p className="text-lg font-medium text-brand-primary">{enhancedPetData.height}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-brand-primary text-sm font-semibold tracking-wide">MICROCHIP NUMBER</p>
                <p className="text-lg font-mono bg-white px-3 py-2 rounded border border-brand-primary text-brand-primary">
                  {enhancedPetData?.microchipId || "Not specified"}
                </p>
              </div>
              {enhancedPetData?.registrationNumber && (
                <div>
                  <p className="text-brand-primary text-sm font-semibold tracking-wide">REGISTRATION NUMBER</p>
                  <p className="text-lg font-mono bg-white px-3 py-2 rounded border border-brand-primary text-brand-primary">
                    {enhancedPetData.registrationNumber}
                  </p>
                </div>
              )}
            </div>
            
            {enhancedPetData?.bio && (
              <div className="bg-white p-4 rounded-lg border border-brand-primary">
                <p className="text-brand-primary text-sm font-semibold tracking-wide mb-2">BIO</p>
                <p className="text-brand-primary">{enhancedPetData.bio}</p>
              </div>
            )}
            
            <div className="bg-white p-4 rounded-lg border border-brand-primary">
              <p className="text-brand-primary text-sm font-semibold tracking-wide mb-2">DESCRIPTION & UNIQUE TRAITS</p>
              <p className="text-brand-primary">{enhancedPetData?.notes || "No description specified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
