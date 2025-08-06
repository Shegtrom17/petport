
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, AlertTriangle } from "lucide-react";
import { NavigationTabs } from "@/components/NavigationTabs";
import { ReportIssueModal } from "@/components/ReportIssueModal";

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
          <Button variant="outline" size="icon" className="md:hidden h-8 w-8 sm:h-10 sm:w-10">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-navy-900">Navigation</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 sm:h-8 sm:w-8"
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
          
          <div className="mt-6 pt-4 border-t border-gold-500/20">
            <ReportIssueModal>
              <Button 
                variant="outline"
                className="w-full justify-start space-x-3 text-sm py-3 border-gold-500/30 text-navy-800 hover:text-gold-500 hover:bg-navy-900/10 hover:border-gold-500/50 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Report Issue</span>
              </Button>
            </ReportIssueModal>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
