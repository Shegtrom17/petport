
import { Button } from "@/components/ui/button";
import { FileText, Badge, Star, Heart, MapPin, Camera, Shield, Search } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

export const NavigationTabs = ({ activeTab, onTabChange, isMobile = false }: NavigationTabsProps) => {
  const tabs = [
    { id: "profile", label: "PROFILE", icon: FileText },
    { id: "care", label: "CARE & HANDLING", icon: Heart },
    { id: "documents", label: "OFFICIAL PDF'S", icon: FileText },
    { id: "resume", label: "CREDENTIALS", icon: Badge },
    { id: "travel", label: "GLOBAL JOURNEYS", icon: MapPin },
    { id: "gallery", label: "PORTRAIT GALLERY", icon: Camera },
    { id: "quickid", label: "LOST PET", icon: Search },
  ];

  if (isMobile) {
    return (
      <div className="space-y-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => onTabChange(tab.id)}
            className={`w-full justify-start space-x-3 transition-all text-sm sm:text-base py-2 sm:py-3 ${
              activeTab === tab.id 
                ? "bg-gradient-to-r from-theme-primary-dark to-theme-primary-medium text-theme-accent shadow-lg border border-theme-accent/30" 
                : "text-theme-primary-medium hover:text-theme-accent hover:bg-theme-primary-dark hover:shadow-md border border-transparent hover:border-theme-accent/20"
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
    <div className="hidden md:flex flex-wrap gap-2 p-4 bg-gradient-to-br from-theme-accent to-theme-accent-light backdrop-blur-sm rounded-xl border border-theme-accent/30 shadow-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 transition-all text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 ${
            activeTab === tab.id 
              ? "bg-gradient-to-r from-theme-primary-dark to-theme-primary-medium text-theme-accent shadow-lg border border-theme-accent/30 hover:from-theme-primary-medium hover:to-theme-primary-dark" 
              : "text-theme-primary-dark hover:text-theme-primary-medium hover:bg-theme-primary-dark/20 hover:shadow-md border border-transparent hover:border-theme-primary-dark/30"
          }`}
        >
          <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
