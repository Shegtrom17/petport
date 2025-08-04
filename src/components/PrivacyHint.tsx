import { Lock, Unlock, Info, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PrivacyHintProps {
  isPublic: boolean;
  feature: string;
  variant?: "banner" | "inline" | "badge";
  showToggle?: boolean;
  onTogglePrivacy?: () => void;
}

export const PrivacyHint = ({ 
  isPublic, 
  feature, 
  variant = "inline", 
  showToggle = false,
  onTogglePrivacy 
}: PrivacyHintProps) => {
  if (variant === "badge") {
    return (
      <Badge 
        variant={isPublic ? "secondary" : "outline"}
        className={`flex items-center gap-1 text-xs ${
          isPublic 
            ? "bg-green-100 text-green-700 border-green-200" 
            : "bg-amber-100 text-amber-700 border-amber-200"
        }`}
      >
        {isPublic ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
        {isPublic ? "Public" : "Private"}
      </Badge>
    );
  }

  if (variant === "banner" && !isPublic) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800">
              <strong>Profile is private.</strong> {feature} requires a public profile to work.
            </p>
            {showToggle && onTogglePrivacy && (
              <Button
                onClick={onTogglePrivacy}
                size="sm"
                variant="outline"
                className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Settings className="w-3 h-3 mr-1" />
                Enable Public Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline" && !isPublic) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
        <Lock className="w-3 h-3" />
        <span>Public profile required for {feature.toLowerCase()}</span>
      </div>
    );
  }

  return null;
};