import { ReactNode } from "react";
import { BottomTabNavigation } from "./BottomTabNavigation";

interface PWALayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const PWALayout = ({ children, showBottomNav = true }: PWALayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding for tab navigation */}
      <main className={`${showBottomNav ? "pb-16" : ""}`}>
        {children}
      </main>
      
      {/* Bottom tab navigation */}
      {showBottomNav && <BottomTabNavigation />}
    </div>
  );
};