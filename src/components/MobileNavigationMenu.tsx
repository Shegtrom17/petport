
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedSheet } from "@/components/ui/enhanced-sheet";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { NavigationTabs } from "@/components/NavigationTabs";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { useNavigate } from "react-router-dom";

interface MobileNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const MobileNavigationMenu = ({ isOpen, onClose, activeTab, onTabChange }: MobileNavigationMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    onClose();
  };

  return (
    <>
      <EnhancedSheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 sm:w-80 p-0">
          <SheetHeader className="p-4 sm:p-6 border-b border-border">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {activeTab && onTabChange && (
              <div className="px-2">
                <NavigationTabs 
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  isMobile={true}
                />
              </div>
            )}
            <div className="px-4 space-y-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/help');
                  onClose();
                }}
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Help
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowReportModal(true);
                  onClose();
                }}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Report an Issue
              </Button>
            </div>
          </div>
        </SheetContent>
      </EnhancedSheet>

      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </>
  );
};
