
import { Card } from "@/components/ui/card";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import { usePetData } from "@/hooks/usePetData";

interface PetPassportCardProps {
  petData: any;
  onUpdate?: () => void;
}

export const PetPassportCard = ({ petData, onUpdate }: PetPassportCardProps) => {
  const { togglePetPublicVisibility } = usePetData();

  const handlePrivacyToggle = async (isPublic: boolean) => {
    if (petData?.id) {
      const success = await togglePetPublicVisibility(petData.id, isPublic);
      if (success && onUpdate) {
        onUpdate(); // Trigger parent component to refresh data
      }
      return success;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <PrivacyToggle 
        isPublic={petData?.is_public || false}
        onToggle={handlePrivacyToggle}
      />
    <Card className="mb-6 sm:mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-navy-900 to-slate-800 text-white">
      <div className="bg-gradient-to-r from-navy-900 to-slate-800 p-4 sm:p-6 text-white relative overflow-hidden">
        {/* Simple decorative elements instead of world map */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-yellow-500/10 rounded-full -translate-y-8 sm:-translate-y-12 md:-translate-y-16 translate-x-8 sm:translate-x-12 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-yellow-500/10 rounded-full translate-y-6 sm:translate-y-9 md:translate-y-12 -translate-x-6 sm:-translate-x-9 md:-translate-x-12"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8 relative z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 flex-1">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-4 border-yellow-500/50 shadow-lg flex-shrink-0">
              <img 
                src={petData.photoUrl || "https://placehold.co/100x100?text=" + petData.name?.charAt(0)} 
                alt={petData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-yellow-400 mb-1 tracking-wide break-words">{petData.name?.toUpperCase()}</h2>
              <p className="text-yellow-200 text-sm sm:text-base md:text-lg mb-2">{petData.breed} • {petData.age}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-6 text-xs sm:text-sm mb-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-200">Weight: {petData.weight}</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-200">Breed: {petData.breed}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center sm:min-w-[200px] md:min-w-[250px]">
            <div className="mb-3 flex justify-center">
              <img 
                src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png"
                alt="PetPort Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
                onError={(e) => {
                  console.error("PetPort logo failed to load:", e);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => console.log("PetPort logo loaded successfully")}
              />
            </div>
            <p className="text-yellow-400 text-sm sm:text-base md:text-lg tracking-wide font-bold">GLOBE TROTTER</p>
            <p className="text-xs sm:text-sm text-yellow-300 font-mono">ID: {petData.petPassId}</p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
      </div>
    </Card>
    </div>
  );
};
