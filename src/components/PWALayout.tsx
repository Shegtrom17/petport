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
    <div className="h-screen flex flex-col bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Dedicated scroll container for iOS PTR control */}
      <main 
        id="app-scroll-container"
        className={`flex-1 overflow-y-auto overflow-x-hidden native-scroll hide-scrollbar touch-pan-y overscroll-y-contain ${showBottomNav ? "pb-16 pb-safe-area-inset-bottom" : ""}`}
      >
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
};