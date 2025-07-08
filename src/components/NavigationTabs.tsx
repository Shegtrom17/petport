
import { Button } from "@/components/ui/button";
import { FileText, Award, Badge, Star, Heart, MapPin, Users } from "lucide-react";

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
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 ${
            activeTab === tab.id 
              ? "bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 shadow-lg border border-gold-500/30" 
              : "text-gray-600 hover:text-navy-800 hover:bg-navy-50"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
