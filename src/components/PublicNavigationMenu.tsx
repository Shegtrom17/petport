import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedSheet } from "@/components/ui/enhanced-sheet";
import { Home, Sparkles, Search, Users, MonitorPlay, Award, Heart, HelpCircle, LogIn, Headphones, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicNavigationMenu = ({ isOpen, onClose }: PublicNavigationMenuProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const pages = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "features", label: "Features", icon: Sparkles, path: "/learn" },
    { id: "lost-pet", label: "Lost Pet Solutions", icon: Search, path: "/lost-pet-features" },
    { id: "foster", label: "Foster Program", icon: Users, path: "/foster-program" },
    { id: "podcast", label: "Podcast", icon: Headphones, path: "/podcast" },
    { id: "demos", label: "Live Demos", icon: MonitorPlay, path: "/demos" },
    { id: "vaccination", label: "Vaccination Guide", icon: Syringe, path: "/vaccination-guide" },
    { id: "resume", label: "Dog Gone Good", icon: Award, path: "/dog-gone-good" },
  ];

  return (
    <EnhancedSheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-72 sm:w-80 p-0 flex flex-col min-h-0 h-[100svh]"
      >
        <SheetHeader className="p-4 sm:p-6 border-b border-border">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto native-scroll hide-scrollbar with-keyboard-padding py-4">
          <div className="px-2 space-y-2">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => handleNavigation(page.path)}
              >
                <page.icon className="w-5 h-5 mr-3" />
                {page.label}
              </Button>
            ))}
          </div>
          
          <div className="px-2 space-y-2 mt-4 pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => handleNavigation('/gift')}
            >
              <Heart className="w-5 h-5 mr-3 text-rose-500" />
              🎁 Give as a Gift
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => handleNavigation('/help')}
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              Help
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => handleNavigation('/auth')}
            >
              <LogIn className="w-5 h-5 mr-3" />
              Sign In
            </Button>
          </div>
        </div>
      </SheetContent>
    </EnhancedSheet>
  );
};
