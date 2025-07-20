
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
        {/* Left Column - Pet Overview */}
        <div className="space-y-4">
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500/50 shadow-lg">
                  <img 
                    src={enhancedPetData.photoUrl || "/placeholder.svg"} 
                    alt={enhancedPetData.name || "Pet"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-serif font-bold text-navy-900 mb-1">{enhancedPetData.name || "Unknown Pet"}</h2>
                  <p className="text-navy-600 mb-2">{enhancedPetData.breed || "Unknown Breed"} • {enhancedPetData.age || "Unknown Age"}</p>
                  <div className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 px-4 py-2 rounded-full font-mono text-sm font-bold">
                    {enhancedPetData.petPassId || "No ID"}
                  </div>
                </div>
                <div className="w-full border-t border-gold-500/30 pt-4">
                  <h3 className="text-lg font-serif font-bold text-navy-900 mb-3 text-center border-b-2 border-gold-500 pb-1">Certifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {enhancedPetData.badges?.slice(0, 4).map((badge: string, index: number) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                          <span className="text-xl">🏆</span>
                        </div>
                        <p className="text-xs text-navy-700 font-medium">{badge}</p>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SupportAnimalBanner status={enhancedPetData.supportAnimalStatus} />

          <SocialShareButtons 
            petName={enhancedPetData.name || "Pet"}
            petId={selectedPet?.id || enhancedPetData.id || ""}
            isMissingPet={false}
          />
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
