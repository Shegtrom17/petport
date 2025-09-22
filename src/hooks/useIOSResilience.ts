import { useEffect, useCallback, useState } from 'react';
import { isIOSDevice, isIOSSafari, checkIOSMemoryPressure, logIOSError } from '@/utils/iosDetection';

interface IOSResilienceConfig {
  enableMemoryMonitoring?: boolean;
  enableVisibilityRecovery?: boolean;
  enableTimeoutProtection?: boolean;
  timeoutMs?: number;
}

export const useIOSResilience = (config: IOSResilienceConfig = {}) => {
  const {
    enableMemoryMonitoring = true,
    enableVisibilityRecovery = true,
    enableTimeoutProtection = true,
    timeoutMs = 5000
  } = config;

  const [isVisible, setIsVisible] = useState(true);
  const [memoryPressure, setMemoryPressure] = useState(false);

  // Memory monitoring for iOS
  useEffect(() => {
    if (!enableMemoryMonitoring || !isIOSDevice()) return;

    const checkMemory = () => {
      const { isHigh } = checkIOSMemoryPressure();
      setMemoryPressure(isHigh);
    };

    checkMemory();
    const interval = setInterval(checkMemory, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [enableMemoryMonitoring]);

  // Visibility recovery for iOS Safari
  useEffect(() => {
    if (!enableVisibilityRecovery || !isIOSSafari()) return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      
      if (!document.hidden) {
        // App became visible again - check if we need to recover
        setTimeout(() => {
          if (memoryPressure) {
            console.log('iOS: App regained focus with memory pressure - considering recovery');
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableVisibilityRecovery, memoryPressure]);

  // Timeout protection wrapper
  const withTimeout = useCallback(<T,>(
    promise: Promise<T>,
    operation: string,
    customTimeout?: number
  ): Promise<T> => {
    if (!enableTimeoutProtection) return promise;

    const timeout = customTimeout || timeoutMs;
    
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          const error = new Error(`Operation '${operation}' timed out after ${timeout}ms`);
          logIOSError(error, 'Timeout Protection');
          reject(error);
        }, timeout);
      })
    ]);
  }, [enableTimeoutProtection, timeoutMs]);

  // Safe async operation wrapper
  const safeAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    fallback: T,
    operationName: string
  ): Promise<T> => {
    try {
      return await withTimeout(operation(), operationName);
    } catch (error) {
      logIOSError(error as Error, `SafeAsync: ${operationName}`);
      return fallback;
    }
  }, [withTimeout]);

  return {
    isIOSDevice: isIOSDevice(),
    isIOSSafari: isIOSSafari(),
    isVisible,
    memoryPressure,
    withTimeout,
    safeAsync,
  };
};