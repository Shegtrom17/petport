import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Button } from '@/components/ui/button';

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
      {/* Ephemeral snap-in bar - only visible when refreshing */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isRefreshing ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ pointerEvents: isRefreshing ? 'auto' : 'none' }}
        aria-live="polite"
        role="status"
      >
        <div className="bg-primary/95 backdrop-blur-md shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
              <span className="text-sm font-medium text-white">
                Refreshing...
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="text-white hover:bg-white/20 h-8 px-3"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - no transform, keep scroll working */}
      {children}
    </div>
  );
};