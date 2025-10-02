import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedSheet } from "@/components/ui/enhanced-sheet";
import { HelpCircle, AlertTriangle, FileText, Heart, Badge, MapPin, Camera, Search, Syringe, Settings, RefreshCw } from "lucide-react";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { useNavigate } from "react-router-dom";
import { isIOSDevice } from "@/utils/iosDetection";
import { toast } from "sonner";

interface MobileNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigationMenu = ({ isOpen, onClose }: MobileNavigationMenuProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showIOSRefresh, setShowIOSRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowIOSRefresh(isIOSDevice());
  }, []);

  const handleRefresh = () => {
    onClose();
    toast.info("Refreshing...");
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handlePageNavigation = (tab: string) => {
    // Trigger the tab change event for the Index page
    window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: tab }));
    onClose();
  };

  const pages = [
    { id: "profile", label: "Profile", icon: FileText },
    { id: "care", label: "Care & Handling", icon: Heart },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "resume", label: "Resume", icon: Badge },
    { id: "travel", label: "Global Journeys", icon: MapPin },
    { id: "gallery", label: "Portrait Gallery", icon: Camera },
    { id: "quickid", label: "Lost Pet", icon: Search },
    { id: "vaccination", label: "Vaccination Guide", icon: Syringe },
  ];

  return (
    <>
      <EnhancedSheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 sm:w-80 p-0">
          <SheetHeader className="p-4 sm:p-6 border-b border-border">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="py-4">
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
              
              {/* iOS-only refresh fallback */}
              {showIOSRefresh && (
                <>
                  <div className="border-t border-border my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    Refresh App
                  </Button>
                </>
              )}
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
