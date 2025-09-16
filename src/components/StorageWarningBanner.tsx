import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Component that detects non-persistent storage (Private Browsing, etc.)
 * and warns users that they may need to sign in repeatedly
 */
export const StorageWarningBanner = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null);

  useEffect(() => {
    const checkStoragePersistence = async () => {
      try {
        // Test if localStorage works properly
        const testKey = 'storage-test';
        const testValue = 'test';
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrieved !== testValue) {
          setShowWarning(true);
          setIsChecking(false);
          return;
        }

        // Check if we're in private browsing mode (Safari specific)
        try {
          // In private browsing, this will throw or behave differently
          localStorage.setItem('__private_test__', '1');
          localStorage.removeItem('__private_test__');
          
          // Additional check for Safari Private Browsing
          if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
            // Try to use indexedDB as another indicator
            if (!window.indexedDB) {
              setShowWarning(true);
            }
          }
        } catch (e) {
          // Likely in private browsing
          setShowWarning(true);
        }

        // Proactive storage quota management
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          try {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota && estimate.usage) {
              const usagePercent = (estimate.usage / estimate.quota) * 100;
              setStorageUsage({
                used: estimate.usage,
                quota: estimate.quota
              });
              
              // Show warning at 80% usage or if quota is very small
              if (usagePercent > 80 || estimate.quota < 50 * 1024 * 1024) {
                setShowWarning(true);
              }
            }
          } catch (e) {
            // Ignore errors
          }
        }

      } catch (error) {
        console.warn('Storage check failed:', error);
        setShowWarning(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkStoragePersistence();
  }, []);

  if (isChecking || !showWarning) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <span className="font-medium text-amber-800 dark:text-amber-200">
            {storageUsage ? 'Storage Space Low' : 'Limited Storage Detected'}
          </span>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {storageUsage ? (
              <>Storage is {Math.round((storageUsage.used / storageUsage.quota) * 100)}% full. 
              Consider clearing browser cache or freeing up space to prevent app issues.</>
            ) : (
              <>Your browser is in Private Browsing mode or has storage restrictions. 
              You may need to sign in each time you visit the app.</>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowWarning(false)}
          className="h-auto p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};