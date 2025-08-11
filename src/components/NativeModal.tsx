import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  fullScreen?: boolean;
}

export const NativeModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  fullScreen = false 
}: NativeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 touch-feedback"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`${fullScreen ? 'min-h-full' : 'p-4'} pb-8`}>
          {children}
        </div>
      </div>
    </div>
  );
};