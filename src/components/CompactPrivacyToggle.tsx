import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CompactPrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => Promise<boolean>;
  disabled?: boolean;
}

export const CompactPrivacyToggle: React.FC<CompactPrivacyToggleProps> = ({
  isPublic,
  onToggle,
  disabled = false
}) => {
  const [isToggling, setIsToggling] = React.useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    if (isToggling || disabled) return;
    
    setIsToggling(true);
    try {
      const success = await onToggle(checked);
      if (success) {
        toast({
          title: checked ? "Profile is now public" : "Profile is now private",
          description: checked 
            ? "Anyone with the link can view this profile" 
            : "Only you can view this profile"
        });
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center space-x-2" title={isPublic ? "Public profile - all sections can be shared" : "Private profile - set to public to enable sharing"}>
      <div className="flex items-center space-x-1">
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : isPublic ? (
          <Globe className="h-4 w-4 text-gold-500" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isToggling || disabled}
      />
    </div>
  );
};