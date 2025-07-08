
import { Button } from "@/components/ui/button";
import { FileText, Award, Badge, Star, Heart, MapPin, Users, Camera } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
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

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-slate-100 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 transition-all ${
            activeTab === tab.id 
              ? "bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 shadow-lg border border-gold-500/30 hover:from-navy-800 hover:to-navy-700" 
              : "text-navy-800 hover:text-gold-500 hover:bg-navy-900 hover:shadow-md border border-transparent hover:border-gold-500/20"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
