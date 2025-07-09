
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { NavigationTabs } from "@/components/NavigationTabs";

interface MobileNavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavigationMenu = ({ activeTab, onTabChange }: MobileNavigationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false); // Close menu after selection
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-navy-900">Navigation</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <NavigationTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              isMobile={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
