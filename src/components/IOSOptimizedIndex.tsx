import React, { Suspense } from 'react';
import { SafeErrorBoundary } from '@/components/SafeErrorBoundary';
import { isIOSDevice } from '@/utils/iosDetection';

interface IOSOptimizedIndexProps {
  children: React.ReactNode;
  activeTab: string;
}

const IOSLoadingFallback = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-pulse mb-2">Loading {message}...</div>
      {isIOSDevice() && (
        <div className="text-xs text-muted-foreground">
          Optimizing for iOS
        </div>
      )}
    </div>
  </div>
);

export const IOSOptimizedIndex: React.FC<IOSOptimizedIndexProps> = ({ children, activeTab }) => {
  if (!isIOSDevice()) {
    return <>{children}</>;
  }

  return (
    <SafeErrorBoundary level="page" name="iOS Optimized Index">
      <Suspense fallback={<IOSLoadingFallback message="app" />}>
        <div className="ios-optimized-container">
          <SafeErrorBoundary level="section" name="Main Content">
            <Suspense fallback={<IOSLoadingFallback message="content" />}>
              {children}
            </Suspense>
          </SafeErrorBoundary>
        </div>
      </Suspense>
    </SafeErrorBoundary>
  );
};