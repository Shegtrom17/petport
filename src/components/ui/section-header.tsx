import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  overline?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  overline,
  icon,
  action,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center space-x-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          {overline && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {overline}
            </p>
          )}
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
        </div>
      </div>
      {action && (
        <div className="flex items-center space-x-2">
          {action}
        </div>
      )}
    </div>
  );
};