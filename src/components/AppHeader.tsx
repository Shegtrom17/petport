import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isIOSPWA } from "@/utils/iosDetection";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const AppHeader = ({ title, showBack = false, actions }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPWA = isIOSPWA();

  const handleBack = () => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // No history - smart fallback based on current route
      const path = location.pathname;
      
      // If on a pet-specific page, go to /app
      if (path.includes('/profile/') || path.includes('/resume/') || 
          path.includes('/care/') || path.includes('/gallery/') ||
          path.includes('/travel/') || path.includes('/documents/')) {
        navigate('/app');
      } else if (path !== '/app' && path !== '/') {
        // For other pages, go to /app
        navigate('/app');
      }
      // If already on /app or /, do nothing (no back available)
    }
  };

  // Show back button if:
  // 1. Explicitly requested via showBack prop, OR
  // 2. Running as iOS PWA (no native back button), OR
  // 3. There's history to go back to
  const shouldShowBack = showBack || isPWA || window.history.length > 1;

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
          {actions}
        </div>
      </div>
    </header>
  );
};