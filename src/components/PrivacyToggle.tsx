
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => Promise<boolean>;
  disabled?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPublic,
  onToggle,
  disabled = false
}) => {
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    if (isToggling || disabled) return;
    
    setIsToggling(true);
    try {
      await onToggle(checked);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-gold-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            {isPublic ? (
              <Globe className="h-5 w-5 text-gold-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <Label htmlFor="privacy-toggle" className="text-sm font-medium">
                {isPublic ? 'Public Profile' : 'Private Profile'}
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {isPublic 
                  ? 'Anyone can view this pet\'s profile with the link'
                  : 'Only you can view this pet\'s profile'
                }
              </p>
            </div>
          </div>
          <Switch
            id="privacy-toggle"
            checked={isPublic}
            onCheckedChange={handleToggle}
            disabled={isToggling || disabled}
          />
        </div>
        {isPublic && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> When public, your pet's profile can be viewed by anyone with the link. 
              Personal contact information will still be protected.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
