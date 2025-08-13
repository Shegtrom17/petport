import * as React from "react"
import { Dialog as BaseDialog } from "./dialog"
import { useOverlayStore } from "@/stores/overlayStore"

interface EnhancedDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EnhancedDialog = ({ children, open, onOpenChange, ...props }: EnhancedDialogProps) => {
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
    <BaseDialog open={open} onOpenChange={handleOpenChange} {...props}>
      {children}
    </BaseDialog>
  );
};