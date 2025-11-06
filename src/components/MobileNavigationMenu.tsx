
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedSheet } from "@/components/ui/enhanced-sheet";
import { HelpCircle, AlertTriangle, FileText, Heart, Badge, MapPin, Camera, Search, Syringe, Settings, DollarSign } from "lucide-react";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { useNavigate } from "react-router-dom";

interface MobileNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigationMenu = ({ isOpen, onClose }: MobileNavigationMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  const handlePageNavigation = (tab: string) => {
    // Trigger the tab change event for the Index page
    window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: tab }));
    onClose();
  };

  const pages = [
    { id: "profile", label: "Home", icon: FileText },
    { id: "care", label: "Care & Handling", icon: Heart },
    { id: "resume", label: "Resume", icon: Badge },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "travel", label: "Global Journeys", icon: MapPin },
    { id: "gallery", label: "Portrait Gallery", icon: Camera },
    { id: "quickid", label: "Lost Pet", icon: Search },
  ];

  return (
    <>
      <EnhancedSheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
  side="left"
  className="w-72 sm:w-80 p-0 flex flex-col min-h-0 h-[100svh]"
>

          <SheetHeader className="p-4 sm:p-6 border-b border-border">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
         <div className="flex-1 min-h-0 overflow-y-auto native-scroll hide-scrollbar with-keyboard-padding py-4">
            <div className="px-2 space-y-2">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => handlePageNavigation(page.id)}
                >
                  <page.icon className="w-5 h-5 mr-3" />
                  {page.label}
                </Button>
              ))}
            </div>
            <div className="px-2 space-y-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  navigate('/vaccination-guide');
                  onClose();
                }}
              >
                <Syringe className="w-5 h-5 mr-3" />
                Vaccination Guide
              </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() => {
              navigate('/gift');
              onClose();
            }}
          >
            <Heart className="w-5 h-5 mr-3 text-rose-500" />
            🎁 Give as a Gift
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-[#5691af] hover:text-[#4a7d99] hover:bg-[#5691af]/10 font-medium"
            onClick={() => {
              navigate('/referrals');
              onClose();
            }}
          >
            <DollarSign className="w-5 h-5 mr-3" />
            🎁 Refer & Earn
          </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  navigate('/profile');
                  onClose();
                }}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  navigate('/help');
                  onClose();
                }}
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                Help
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  setShowReportModal(true);
                  onClose();
                }}
              >
                <AlertTriangle className="w-5 h-5 mr-3" />
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
