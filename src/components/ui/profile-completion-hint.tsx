import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Edit } from "lucide-react";

interface ProfileCompletionHintProps {
  variant?: 'info' | 'warning';
  className?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  customMessage?: string;
}

export const ProfileCompletionHint: React.FC<ProfileCompletionHintProps> = ({
  variant = 'info',
  className = '',
  showEditButton = true,
  onEditClick,
  customMessage
}) => {
  const defaultMessage = "Go to specific pages to edit and update specific information";
  
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <span>{customMessage || defaultMessage}</span>
          {showEditButton && onEditClick && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditClick}
              className="ml-4 text-blue-600 border-blue-200 hover:bg-blue-100"
            >
              <Edit className="w-3 h-3 mr-1" />
              General Profile
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileCompletionHint;