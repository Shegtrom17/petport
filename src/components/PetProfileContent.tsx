
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  // Ensure user_id is passed through to petData
  const enhancedPetData = {
    ...petData,
    user_id: selectedPet?.user_id || petData.user_id
  };

  const handleProfileEdit = () => {
    console.log("Profile edit clicked - switching to profile edit mode");
    // Dispatch custom event that the PetProfileCard can listen to
    window.dispatchEvent(new CustomEvent('start-pet-profile-edit'));
  };

  return (
    <div className="passport-map-container">
      <div className="passport-map-bg" />
      
      {/* Prominent Edit Button at the Top */}
      <div className="flex justify-center mb-6">
        <ProfileEditButton 
          userId={enhancedPetData.user_id} 
          onEdit={handleProfileEdit}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Pet Overview */}
        <div className="space-y-4">
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500/50 shadow-lg">
                  <img 
                    src={enhancedPetData.photoUrl || "/placeholder.svg"} 
                    alt={enhancedPetData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-serif font-bold text-navy-900 mb-1">{enhancedPetData.name}</h2>
                  <p className="text-navy-600 mb-2">{enhancedPetData.breed} • {enhancedPetData.age}</p>
                  <div className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 px-4 py-2 rounded-full font-mono text-sm font-bold">
                    {enhancedPetData.petPassId}
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

          {/* Support Animal Status */}
          <SupportAnimalBanner status={enhancedPetData.supportAnimalStatus} />

          {/* Social Sharing */}
          <SocialShareButtons 
            petName={enhancedPetData.name}
            petId={selectedPet?.id || enhancedPetData.id || ""}
            isMissingPet={false}
          />
        </div>

        {/* Right Column - Main Actions */}
        <div className="space-y-4">
          {/* PDF Generation Card */}
          <Card className="bg-[#f8f8f8] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-navy-900 border-b-2 border-gold-500 pb-2">
                🛂 PASSPORT DOCUMENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PetPDFGenerator petId={selectedPet?.id || enhancedPetData.id || ""} petName={enhancedPetData.name} />
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
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

          {/* Medical Alert Card */}
          {enhancedPetData.medicalAlert && (
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-red-400 hover:border-red-300"
                  onClick={() => setActiveTab("care")}>
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-1">⚠️ MEDICAL ALERT</h3>
                  <p className="text-red-100 text-sm mb-2">{enhancedPetData.medicalConditions}</p>
                  <div className="mt-3 pt-2 border-t border-red-400/50">
                    <p className="text-red-200 text-xs font-medium">
                      👆 Click to view full medical details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
