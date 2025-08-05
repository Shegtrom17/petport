
import { PlusCircle, LogOut, LogIn, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { LostPetButton } from "@/components/LostPetButton";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import worldMapOutline from "@/assets/world-map-outline.png";

interface PetHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedPetId?: string;
  selectedPetName?: string;
  selectedPet?: any;
}

export const PetHeader = ({ activeTab, onTabChange, selectedPetId, selectedPetName, selectedPet }: PetHeaderProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 relative passport-map-container">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 100%),
            url(${worldMapOutline}),
            linear-gradient(45deg, transparent 48%, rgba(160, 82, 45, 0.12) 49%, rgba(160, 82, 45, 0.12) 51%, transparent 52%),
            linear-gradient(45deg, rgba(205, 133, 63, 0.04) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(222, 184, 135, 0.04) 25%, transparent 25%)
          `,
          backgroundSize: '100% 100%, contain, 8px 8px, 6px 6px, 6px 6px',
          backgroundPosition: 'center, center, 0 0, 0 0, 0 3px',
          backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat, repeat',
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0">
              <img 
                src="/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png" 
                alt="PetPort Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Header logo failed to load:", e);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => console.log("Header logo loaded successfully")}
              />
            </div>
            <div className="hidden sm:block min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-navy-900 tracking-wide truncate">
                Digital Pet Passport
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
            {user ? (
              <>
                <LostPetButton 
                  petId={selectedPetId} 
                  petName={selectedPetName}
                  petData={selectedPet}
                  className="text-xs sm:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-2 h-8 sm:h-10" 
                />
                <Button 
                  className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap"
                  onClick={() => navigate('/add-pet')}
                >
                  <PlusCircle className="mr-0.5 sm:mr-1 h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="hidden sm:inline">Add Pet</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <ReportIssueModal>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Report Issue"
                    className="h-8 w-8 sm:h-10 sm:w-10 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                  </Button>
                </ReportIssueModal>
                <MobileNavigationMenu activeTab={activeTab} onTabChange={onTabChange} />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={signOut}
                  title="Sign Out"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </>
            ) : (
              <Button 
                className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> 
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="sm:hidden mt-2 text-center">
          <h1 className="text-sm font-bold text-navy-900 tracking-wide">
            Digital Pet Passport
          </h1>
        </div>
      </div>
    </header>
  );
};
