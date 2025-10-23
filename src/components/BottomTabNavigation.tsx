import { NavLink, useLocation } from "react-router-dom";
import { Home, PlusCircle, Settings, AlertTriangle, Menu } from "lucide-react";
import { ReportIssueModal } from "./ReportIssueModal";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { useState } from "react";
import { useKeyboardAwareLayout } from "@/hooks/useKeyboardAwareLayout";
import { Hotspot } from "./Hotspot";

export const BottomTabNavigation = () => {
  const location = useLocation();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const { isVisible: keyboardVisible } = useKeyboardAwareLayout();
  
  const homePath = '/app';
  const tabs = [
    { id: 'home', path: homePath, icon: Home, label: 'Home' },
    { id: 'lost-pet', path: '/app', icon: AlertTriangle, label: 'Lost Pet', event: 'navigate-to-quickid' },
    { id: 'add-pet', path: '/add-pet', icon: PlusCircle, label: 'Add Pet' },
    { id: 'settings', path: '/profile', icon: Settings, label: 'Settings' },
    { id: 'menu', path: '#', icon: Menu, label: 'Menu', isMenu: true },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 bottom-tab-nav">
        <div className="flex items-center justify-around h-16 px-2 pb-safe-area-inset-bottom">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                id={tab.id === 'menu' ? 'bottom-nav-menu' : undefined}
                onClick={(e) => {
                  if (tab.id === 'menu') {
                    e.preventDefault();
                    setShowMenuSheet(true);
                  } else if (tab.id === 'lost-pet') {
                    e.preventDefault(); // Prevent navigation to /app
                    window.dispatchEvent(new Event('navigate-to-quickid'));
                  } else if (tab.path === homePath) {
                    window.dispatchEvent(new Event('navigate-to-home'));
                  } else if (tab.event) {
                    window.dispatchEvent(new Event(tab.event));
                  }
                }}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2 transition-colors duration-200 relative ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon 
                  className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`} 
                />
                <span className="text-responsive-xs font-medium text-ellipsis-2 max-w-full text-center leading-tight">
                  {tab.label}
                </span>
                {tab.id === 'menu' && (
                  <div className="absolute -top-2 -right-0">
                    <Hotspot
                      id="bottom-nav-menu"
                      title="All Sections Here"
                      description="Tap Menu to access Care & Handling, Resume, Documents, Travel Map, Gallery, and more!"
                      position="top"
                    />
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
      
      <MobileNavigationMenu 
        isOpen={showMenuSheet}
        onClose={() => setShowMenuSheet(false)}
      />
      
      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </>
  );
};