import { ReactNode } from "react";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

interface PWALayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const PWALayout = ({ children, showBottomNav = true }: PWALayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Main content with bottom padding for tab navigation */}
      <main className={`${showBottomNav ? "pb-16" : ""}`}>
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
};