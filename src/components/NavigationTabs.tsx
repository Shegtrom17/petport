
import { Button } from "@/components/ui/button";
import { FileText, Award, Badge, Star, Heart, MapPin, Users, Camera } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
}

export const NavigationTabs = ({ activeTab, onTabChange, isMobile = false }: NavigationTabsProps) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: FileText },
    { id: "resume", label: "Pet Resume", icon: Badge },
    { id: "reviews", label: "Reviews", icon: Users },
    { id: "travel", label: "Travel Map", icon: MapPin },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "badges", label: "Badges", icon: Award },
    { id: "care", label: "Care Instructions", icon: Heart },
    { id: "quickid", label: "Quick ID", icon: Star },
    { id: "gallery", label: "Photo Gallery", icon: Camera },
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
                ? "bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 shadow-lg border border-gold-500/30" 
                : tab.id === "gallery" 
                  ? "bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-md border border-gold-500/50 hover:from-gold-400 hover:to-gold-300 font-medium"
                  : "text-navy-800 hover:text-gold-500 hover:bg-navy-900 hover:shadow-md border border-transparent hover:border-gold-500/20"
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
    <div className="hidden md:flex flex-wrap gap-2 p-3 bg-slate-100 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 transition-all text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 ${
            activeTab === tab.id 
              ? "bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 shadow-lg border border-gold-500/30 hover:from-navy-800 hover:to-navy-700" 
              : tab.id === "gallery" 
                ? "bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-md border border-gold-500/50 hover:from-gold-400 hover:to-gold-300 font-medium"
                : "text-navy-800 hover:text-gold-500 hover:bg-navy-900 hover:shadow-md border border-transparent hover:border-gold-500/20"
          }`}
        >
          <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
