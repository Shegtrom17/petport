import { ReactNode, useEffect } from "react";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

interface PWALayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const PWALayout = ({ children, showBottomNav = true }: PWALayoutProps) => {
  // Prevent Android back button from exiting PWA
  useAndroidBackButton();

  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Dedicated scroll container for iOS PTR control */}
      <main 
        id="app-scroll-container"
        className={`h-full overflow-y-auto overflow-x-hidden ${showBottomNav ? "pb-16 pb-safe-area-inset-bottom" : ""}`}
        style={{
          overscrollBehaviorY: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
};