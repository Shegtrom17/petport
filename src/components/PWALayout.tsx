import { ReactNode, useEffect } from "react";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import { useKeyboardAwareLayout } from "@/hooks/useKeyboardAwareLayout";
import { isIOSDevice } from "@/utils/iosDetection";

interface PWALayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const PWALayout = ({ children, showBottomNav = true }: PWALayoutProps) => {
  // Prevent Android back button from exiting PWA
  useAndroidBackButton();
  
  // Track keyboard visibility
  const { isVisible: keyboardVisible } = useKeyboardAwareLayout();
  const isIOS = isIOSDevice();
  
  // On Android, hide bottom nav when keyboard is visible
  const navVisible = showBottomNav && !(keyboardVisible && !isIOS);

  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Main content with bottom padding for tab navigation */}
      <main className={`${navVisible ? "pb-20" : ""} flex-1 overflow-y-auto with-keyboard-padding`}>
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {navVisible && <BottomTabNavigation />}
    </div>
  );
};