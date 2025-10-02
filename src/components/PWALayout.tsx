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
      
      {/* Main content with bottom padding for tab navigation */}
      <main className={`${showBottomNav ? "pb-16 pb-safe-area-inset-bottom" : ""}`}>
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
};