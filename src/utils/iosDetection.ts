/**
 * iOS Safari detection and monitoring utilities
 */

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isIOSSafari = (): boolean => {
  const isIOS = isIOSDevice();
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  return isIOS && isSafari;
};

export interface IOSContext {
  userAgent: string;
  memory: any;
  viewport: { width: number; height: number };
  devicePixelRatio: number;
  timestamp: number;
  url: string;
}

export const getIOSContext = (): IOSContext => ({
  userAgent: navigator.userAgent,
  memory: 'memory' in performance ? (performance as any).memory : null,
  viewport: { width: window.innerWidth, height: window.innerHeight },
  devicePixelRatio: window.devicePixelRatio,
  timestamp: Date.now(),
  url: window.location.href
});

export const logIOSError = (error: Error, context: string) => {
  if (!isIOSDevice()) return;
  
  console.error(`iOS Error [${context}]:`, {
    error: error.message,
    stack: error.stack,
    name: error.name,
    context: getIOSContext()
  });
};

export const checkIOSMemoryPressure = (): { isHigh: boolean; recommendation: string } => {
  if (!isIOSDevice() || !('memory' in performance)) {
    return { isHigh: false, recommendation: 'Memory monitoring not available' };
  }

  const memory = (performance as any).memory;
  const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  
  if (usedPercent > 80) {
    return {
      isHigh: true,
      recommendation: 'High memory usage detected. Consider closing other tabs.'
    };
  }
  
  return { isHigh: false, recommendation: 'Memory usage is normal' };
};