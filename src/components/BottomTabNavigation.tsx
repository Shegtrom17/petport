import { NavLink, useLocation } from "react-router-dom";
import { Home, PlusCircle, Settings, AlertTriangle, HelpCircle } from "lucide-react";
import { ReportIssueModal } from "./ReportIssueModal";
import { useState } from "react";

export const BottomTabNavigation = () => {
  const location = useLocation();
  const [showReportModal, setShowReportModal] = useState(false);

  const homePath = '/app';
  const tabs = [
    { path: homePath, icon: Home, label: 'Home' },
    { path: '/lost-pet', icon: AlertTriangle, label: 'Lost Pet' },
    { path: '/add-pet', icon: PlusCircle, label: 'Add Pet' },
    { path: '/profile', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-bottom z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => {
                  if (tab.path === homePath) {
                    window.dispatchEvent(new Event('navigate-to-home'));
                  }
                }}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2 transition-colors duration-200 ${
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
                <span className="text-xs font-medium truncate">
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
      
      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </>
  );
};