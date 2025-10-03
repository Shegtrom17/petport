
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  const location = useLocation();
  const { user } = useAuth();

  const handleBack = () => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // No history to go back to, navigate to home
      navigate('/app');
    }
  };

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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-4 relative z-10">
        {/* Mobile Layout */}
        <div className="flex sm:hidden items-center justify-between">
          {/* Left: Back Button + Title */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 touch-feedback h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-base font-bold text-foreground tracking-wide truncate">
              Digital Portfolio
            </h1>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user && selectedPet && onPrivacyToggle && (
              <div className="scale-75 origin-center">
                <CompactPrivacyToggle
                  isPublic={selectedPet.is_public || false}
                  onToggle={onPrivacyToggle}
                />
              </div>
            )}
            {!user && (
              <Button 
                className="bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20 text-xs px-2 h-8 whitespace-nowrap"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-1 h-3 w-3" /> 
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 md:w-16 md:h-16 lg:w-18 lg:h-18 flex-shrink-0">
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
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-wide truncate">
                Digital Portfolio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user && selectedPet && onPrivacyToggle && (
              <div className="scale-90 origin-center">
                <CompactPrivacyToggle
                  isPublic={selectedPet.is_public || false}
                  onToggle={onPrivacyToggle}
                />
              </div>
            )}
            {!user && (
              <Button 
                className="bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20 text-sm px-3 h-10 whitespace-nowrap"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="mr-1 h-4 w-4" /> 
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
