import { ReactNode, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { isIOSDevice } from '@/utils/iosDetection';

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
  
  const [showBar, setShowBar] = useState(false);

  // Auto-dismiss ephemeral bar after 5 seconds
  useEffect(() => {
    if (pullDistance > 0) {
      setShowBar(true);
      const timer = setTimeout(() => {
        if (!isRefreshing) {
          setShowBar(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else if (!isRefreshing) {
      setShowBar(false);
    }
  }, [pullDistance, isRefreshing]);

  // Only show on iOS
  if (!isIOSDevice()) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Ephemeral slide-in bar - only visible during pull or briefly after */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-primary/5 backdrop-blur-sm border-b border-primary/10 transition-all duration-300 ${
          showBar && pullDistance > 0 ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ 
          height: '48px',
          pointerEvents: isThresholdReached || isRefreshing ? 'auto' : 'none'
        }}
        role="status"
        aria-live="polite"
      >
        <button
          onClick={async () => {
            if (isThresholdReached && !isRefreshing) {
              await onRefresh();
            }
          }}
          disabled={!isThresholdReached || isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
            isThresholdReached 
              ? 'bg-primary text-primary-foreground scale-105 shadow-lg' 
              : 'bg-muted text-muted-foreground'
          }`}
          aria-label={isRefreshing ? 'Refreshing' : isThresholdReached ? 'Release to refresh' : 'Pull down to refresh'}
        >
          <RefreshCw 
            className={`w-4 h-4 transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : isThresholdReached ? 'rotate-180' : ''
            }`} 
          />
          <span className="text-xs font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : isThresholdReached 
                ? 'Release' 
                : 'Pull down'
            }
          </span>
        </button>
      </div>

      {/* Content - no transform, let container handle scrolling */}
      {children}
    </>
  );
};