
import { PlusCircle, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MobileNavigationMenu } from "@/components/MobileNavigationMenu";
import { CompactPrivacyToggle } from "@/components/CompactPrivacyToggle";
import { AppShareButton } from "@/components/AppShareButton";
import worldMapOutline from "@/assets/world-map-outline.png";

interface PetHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedPetId?: string;
  selectedPetName?: string;
  selectedPet?: any;
  onPrivacyToggle?: (isPublic: boolean) => Promise<boolean>;
}

export const PetHeader = ({ activeTab, onTabChange, selectedPetId, selectedPetName, selectedPet, onPrivacyToggle }: PetHeaderProps) => {
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
        {/* Mobile Layout */}
        <div className="flex sm:hidden items-center justify-between">
          {/* Left: Hamburger Menu (Mobile Only) */}
          <div className="flex-shrink-0">
            {user && <MobileNavigationMenu activeTab={activeTab} onTabChange={onTabChange} />}
          </div>
          
          {/* Right: Action Buttons (Mobile Only) */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {user && selectedPet && onPrivacyToggle && (
              <div className="flex flex-col items-center space-y-1">
                <div className="scale-75 origin-center">
                  <CompactPrivacyToggle
                    isPublic={selectedPet.is_public || false}
                    onToggle={onPrivacyToggle}
                  />
                </div>
                <div className="scale-75 origin-center">
                  <AppShareButton variant="icon" />
                </div>
              </div>
            )}
            {!user && (
              <>
                <AppShareButton variant="icon" />
                <Button 
                  className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-xs px-2 h-8 whitespace-nowrap"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="mr-1 h-3 w-3" /> 
                  <span>Sign In</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0">
              <img 
                src="/lovable-uploads/22b5b776-467c-4cee-be36-887346e71205.png" 
                alt="PetPort Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Header logo failed to load:", e);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => console.log("Header logo loaded successfully")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-navy-900 tracking-wide truncate">
                Digital Portfolio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user && selectedPet && onPrivacyToggle && (
              <div className="flex flex-col items-center space-y-2">
                <div className="scale-90 origin-center">
                  <CompactPrivacyToggle
                    isPublic={selectedPet.is_public || false}
                    onToggle={onPrivacyToggle}
                  />
                </div>
                <div className="scale-90 origin-center">
                  <AppShareButton variant="icon" />
                </div>
              </div>
            )}
            {!user && (
              <>
                <AppShareButton variant="icon" />
                <Button 
                  className="bg-gradient-to-r from-theme-primary-dark to-theme-primary-medium hover:from-theme-primary-medium hover:to-theme-primary-dark text-theme-accent border border-theme-accent/30 text-sm px-3 h-10 whitespace-nowrap"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="mr-1 h-4 w-4" /> 
                  <span>Sign In</span>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="sm:hidden mt-2 text-center">
          <h1 className="text-sm font-bold text-navy-900 tracking-wide">
            Digital Portfolio
          </h1>
        </div>
      </div>
    </header>
  );
};
