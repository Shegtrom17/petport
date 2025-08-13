import * as React from "react"
import { Sheet as BaseSheet } from "./sheet"
import { useOverlayStore } from "@/stores/overlayStore"

interface EnhancedSheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EnhancedSheet = ({ children, open, onOpenChange, ...props }: EnhancedSheetProps) => {
  const { open: openOverlay, close: closeOverlay } = useOverlayStore();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      openOverlay();
    } else {
      closeOverlay();
    }
    onOpenChange?.(isOpen);
  };

  return (
    <BaseSheet open={open} onOpenChange={handleOpenChange} {...props}>
      {children}
    </BaseSheet>
  );
};