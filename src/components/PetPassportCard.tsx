import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface PetPassportCardProps {
  petData: any;
  onUpdate?: () => void;
}

export const PetPassportCard = ({ petData, onUpdate }: PetPassportCardProps) => {
  const {
    name,
    breed,
    age,
    weight,
    sex,
    petPassId,
    photoUrl,
    microchip_id,
    registration_number,
    height,
    medical
  } = petData || {};

  return (
    <div className="space-y-4">
    <Card className="mb-6 sm:mb-8 overflow-hidden border-0 shadow-xl bg-brand-primary text-white">
      <div className="bg-brand-primary p-3 sm:p-4 md:p-6 text-white relative overflow-hidden">
        {/* Simple decorative elements instead of world map */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gold-500/10 rounded-full -translate-y-8 sm:-translate-y-12 md:-translate-y-16 translate-x-8 sm:translate-x-12 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-gold-500/10 rounded-full translate-y-6 sm:translate-y-9 md:translate-y-12 -translate-x-6 sm:-translate-x-9 md:-translate-x-12"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8 relative z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6 flex-1">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-4 border-gold-500/50 shadow-lg flex-shrink-0">
              <img 
                src={photoUrl || "https://placehold.co/100x100?text=" + name?.charAt(0)} 
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gold-400 mb-1 tracking-wide break-words">{name?.toUpperCase()}</h2>
              <p className="text-gold-200 text-sm sm:text-base md:text-lg mb-2">{breed} • AGE: {age}</p>
              
              {/* Compact Pet Information Grid - Phase 1 & 2 */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm items-center justify-center sm:justify-start mb-3">
                {/* Core Info */}
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                  <span className="text-gold-200">Weight: {weight}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                  <span className="text-gold-200">Sex: {sex || 'Not specified'}</span>
                </div>

                {/* Optional Fields */}
                {height && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                    <span className="text-gold-200">Ht: {height}</span>
                  </div>
                )}

                {microchip_id && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                    <span className="text-gold-200 truncate max-w-[150px]">Microchip: {microchip_id}</span>
                  </div>
                )}

                {registration_number && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                    <span className="text-gold-200 truncate max-w-[120px]">Reg #: {registration_number}</span>
                  </div>
                )}

                {/* Medical Alert Badge - Inline */}
                {medical?.medical_alert && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1 whitespace-nowrap">
                    🩺 Medical Alert
                  </Badge>
                )}
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
            <p className="text-gold-400 text-sm sm:text-base md:text-lg tracking-wide font-bold">GLOBE TROTTER</p>
            <p className="text-xs sm:text-sm text-gold-300 font-mono">ID: {petPassId}</p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400"></div>
      </div>
    </Card>
    </div>
  );
};
