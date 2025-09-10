import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

export const PullToRefresh = ({ children, onRefresh, disabled = false }: PullToRefreshProps) => {
  const { isRefreshing, pullDistance, isThresholdReached, isPtrActive } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className={`fixed top-4 left-0 right-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm transition-all duration-300 ${
          pullDistance > 0 ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ height: Math.min(pullDistance, 80) }}
      >
        <div className={`flex items-center space-x-2 transition-all duration-200 ${
          isThresholdReached ? 'text-primary scale-110' : 'text-muted-foreground'
        }`}>
          <RefreshCw 
            className={`w-5 h-5 transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : isThresholdReached ? 'rotate-180' : ''
            }`} 
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : isThresholdReached 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)` }}>
        {children}
      </div>
    </div>
  );
};