
import { Button } from "@/components/ui/button";
import { FileText, Badge, Star, Heart, MapPin, Camera, Shield, Search, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

export const NavigationTabs = ({ activeTab, onTabChange, isMobile = false }: NavigationTabsProps) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: "profile", label: "HOME", icon: FileText },
    { id: "care", label: "CARE & HANDLING", icon: Heart },
    { id: "resume", label: "RESUME", icon: Badge },
    { id: "documents", label: "DOCUMENTS", icon: FileText },
    { id: "travel", label: "GLOBAL JOURNEYS", icon: MapPin },
    { id: "gallery", label: "PORTRAIT GALLERY", icon: Camera },
    { id: "quickid", label: "LOST PET", icon: Search, coachId: "quick-id" },
    { id: "vaccination", label: "VACCINATION GUIDE", icon: Syringe, isExternalLink: true },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.isExternalLink && tab.id === "vaccination") {
      navigate('/vaccination-guide');
    } else {
      onTabChange(tab.id);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => handleTabClick(tab)}
            className={`w-full justify-start space-x-3 transition-all text-sm sm:text-base py-2 sm:py-3 ${
              activeTab === tab.id 
                ? "bg-brand-primary text-white shadow-lg" 
                : "text-brand-primary hover:bg-accent/20"
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">{tab.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-wrap gap-2 p-4 bg-passport-section-bg rounded-xl border border-theme-primary-dark/10 shadow-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => handleTabClick(tab)}
          className={`flex items-center space-x-2 transition-all text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 ${
            activeTab === tab.id 
              ? "bg-brand-primary text-white shadow-lg" 
              : "text-brand-primary hover:bg-accent/20"
          }`}
          
        >
          <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
