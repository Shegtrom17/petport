
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { PetPDFGenerator } from "@/components/PetPDFGenerator";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { ProfileEditButton } from "@/components/ProfileEditButton";

interface PetProfileContentProps {
  petData: any;
  selectedPet: any;
  setActiveTab: (tab: string) => void;
  setIsInAppSharingOpen: (open: boolean) => void;
}

export const PetProfileContent = ({ 
  petData, 
  selectedPet, 
  setActiveTab, 
  setIsInAppSharingOpen 
}: PetProfileContentProps) => {
  console.log("PetProfileContent - Received petData:", petData);
  console.log("PetProfileContent - Received selectedPet:", selectedPet);
  
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

  const handleProfileEdit = () => {
    console.log("Profile edit clicked - switching to profile edit mode");
    window.dispatchEvent(new CustomEvent('start-pet-profile-edit'));
  };

  return (
    <div className="passport-map-container">
      <div className="passport-map-bg" />
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Official Photographs */}
        <div className="space-y-4">
          <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-yellow-400">
                <div className="flex items-center space-x-2">
                  <span className="tracking-wide">📷 OFFICIAL PHOTOGRAPHS</span>
                </div>
                <Button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300 border border-gold-500/50 shadow-md font-medium"
                  size="sm"
                >
                  📸 View Gallery ({enhancedPetData?.galleryPhotos?.length || 0})
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <p className="text-yellow-400 text-sm font-semibold tracking-wide">PORTRAIT</p>
                  <div className="aspect-square rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                    <img 
                      src={enhancedPetData?.photoUrl || "/placeholder.svg"} 
                      alt={`${enhancedPetData?.name || "Pet"} portrait`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-yellow-400 text-sm font-semibold tracking-wide">FULL PROFILE</p>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                    <img 
                      src={enhancedPetData?.fullBodyPhotoUrl || "/placeholder.svg"} 
                      alt={`${enhancedPetData?.name || "Pet"} full profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Actions */}
        <div className="space-y-4">
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                🛂 PASSPORT DOCUMENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PetPDFGenerator petId={selectedPet?.id || enhancedPetData.id || ""} petName={enhancedPetData.name || "Pet"} />
            </CardContent>
          </Card>

          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                📋 CONTACT & IDENTIFICATION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enhancedPetData?.emergencyContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">PRIMARY EMERGENCY CONTACT</p>
                  <p className="font-medium">{enhancedPetData.emergencyContact}</p>
                </div>
              )}
              
              {enhancedPetData?.secondEmergencyContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">SECONDARY EMERGENCY CONTACT</p>
                  <p className="font-medium">{enhancedPetData.secondEmergencyContact}</p>
                </div>
              )}
              
              {enhancedPetData?.vetContact && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">VETERINARIAN CONTACT</p>
                  <p className="font-medium">{enhancedPetData.vetContact}</p>
                </div>
              )}
              
              {enhancedPetData?.petCaretaker && (
                <div className="p-3 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 rounded-lg border border-gold-500/30">
                  <p className="text-gold-400 text-sm font-semibold tracking-wide mb-1">PET CARETAKER</p>
                  <p className="font-medium">{enhancedPetData.petCaretaker}</p>
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

          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                ⚡ QUICK ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setActiveTab("documents")}
                className="w-full bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30"
              >
                📄 Manage Documents
              </Button>
              <Button 
                onClick={() => setActiveTab("quickid")}
                variant="outline"
                className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
              >
                🆔 Emergency Quick ID
              </Button>
              <Button 
                onClick={() => setIsInAppSharingOpen(true)}
                variant="outline"
                className="w-full border-navy-900 text-navy-900 hover:bg-navy-50"
              >
                🔗 Share Profile
              </Button>
            </CardContent>
          </Card>

          {/* Medical Alert Banner */}
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


        </div>
      </div>
    </div>
  );
};
