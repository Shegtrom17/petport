
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
          <Button 
            variant="ghost"
            size="icon" 
            className="md:hidden h-8 w-8 sm:h-10 sm:w-10 bg-transparent hover:bg-transparent"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80 p-4 sm:p-6 bg-gradient-to-b from-gold-500 to-gold-400 text-white">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white">Navigation</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 sm:h-8 sm:w-8 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
          <div className="space-y-2">
            <NavigationTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              isMobile={true}
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <ReportIssueModal>
              <Button 
                variant="outline"
                className="w-full justify-start space-x-3 text-sm py-3 border-white/30 text-white hover:text-white hover:bg-white/10 hover:border-white/50 transition-all"
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
