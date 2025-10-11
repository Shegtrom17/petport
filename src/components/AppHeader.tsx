import { ArrowLeft, Gift } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { QuickReferralModal } from "@/components/QuickReferralModal";
import { useState } from "react";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const AppHeader = ({ title, showBack = false, actions }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showReferralModal, setShowReferralModal] = useState(false);

  // ---- iOS Version Detection ----
  const ua = navigator.userAgent;
  const isiOS = /iPhone|iPad|iPod/i.test(ua);
  const match = ua.match(/OS (\d+)_/);
  const iosVersion = match ? parseInt(match[1], 10) : 0;
  const isStandalone =
    (navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;

  // Show back button ONLY for older iOS PWAs (below iOS 15)
  const showForOldIOS = isiOS && iosVersion < 15 && isStandalone;
  const hasHistory = window.history.length > 1;

  const handleBack = () => {
    if (hasHistory) navigate(-1);
  };

  // ---- Display Rule ----
  const shouldShowBack = showForOldIOS && hasHistory;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center space-x-3">
          {shouldShowBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 touch-feedback"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReferralModal(true)}
              className="text-[#5691af] hover:text-[#4a7d99] hover:bg-[#5691af]/10"
              title="Refer & Earn"
            >
              <Gift className="h-5 w-5" />
            </Button>
          )}
          {actions}
        </div>
      </div>

      <QuickReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </header>
  );
};
