import React from 'react';
import { Card } from '@/components/ui/card';
import { Info, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuidanceHintProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'info' | 'gentle';
}

export const GuidanceHint: React.FC<GuidanceHintProps> = ({
  message,
  actionLabel,
  onAction,
  className,
  variant = 'info'
}) => {
  return (
    <Card className={cn(
      "border-l-4 p-4 mb-4",
      variant === 'info' && "border-l-blue-500 bg-blue-50/50 border-blue-200",
      variant === 'gentle' && "border-l-primary bg-primary/5 border-primary/20",
      className
    )}>
      <div className="flex items-center space-x-3">
        <Info className={cn(
          "w-5 h-5 flex-shrink-0",
          variant === 'info' && "text-blue-600",
          variant === 'gentle' && "text-primary"
        )} />
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'info' && "text-blue-800",
            variant === 'gentle' && "text-foreground"
          )}>
            {message}
          </p>
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              "flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-md transition-colors",
              variant === 'info' && "text-blue-700 hover:bg-blue-100",
              variant === 'gentle' && "text-primary hover:bg-primary/10"
            )}
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
};