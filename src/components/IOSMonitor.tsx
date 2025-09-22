import React, { useEffect, useState } from 'react';
import { isIOSDevice, checkIOSMemoryPressure, getIOSContext } from '@/utils/iosDetection';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const IOSMonitor: React.FC = () => {
  const [memoryStatus, setMemoryStatus] = useState<{ isHigh: boolean; recommendation: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isIOSDevice()) return;

    const checkMemory = () => {
      const status = checkIOSMemoryPressure();
      setMemoryStatus(status);
      
      // Show warning if memory is high
      setIsVisible(status.isHigh);
      
      // Log context periodically for debugging
      console.log('iOS Monitor:', {
        ...status,
        context: getIOSContext()
      });
    };

    checkMemory();
    const interval = setInterval(checkMemory, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isIOSDevice() || !isVisible || !memoryStatus?.isHigh) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 bg-warning/10 border-warning">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium">iOS Performance Notice</p>
            <p className="text-xs text-muted-foreground">{memoryStatus.recommendation}</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      </CardContent>
    </Card>
  );
};