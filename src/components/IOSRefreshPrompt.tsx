import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const IOSRefreshPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Only show on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Show prompt after a short delay to let app load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force a hard refresh
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('ios-refresh-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('ios-refresh-dismissed')) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="bg-background/95 backdrop-blur-sm border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium">iOS App Update Available</p>
              <p className="text-xs text-muted-foreground">
                Pull down from the top or tap refresh to get the latest improvements and fixes.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 px-3 text-xs"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh Now
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="h-8 px-3 text-xs"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};