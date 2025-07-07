
import { Button } from "@/components/ui/button";
import { FileText, Award, Badge, Star, Heart } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: FileText },
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
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </Button>
      ))}
    </div>
  );
};
