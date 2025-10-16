import { useEffect, useState, useCallback } from 'react';
import { isIOSDevice } from '@/utils/iosDetection';

interface KeyboardState {
  isVisible: boolean;
  height: number;
  bottomOffset: number;
}

/**
 * Hook to handle keyboard visibility and adjust layout accordingly
 * Uses Visual Viewport API on iOS, fallback to resize events on other platforms
 */
export const useKeyboardAwareLayout = () => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    bottomOffset: 0,
  });

  const updateKeyboardState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();
    
    if (isIOS && window.visualViewport) {
      // Use Visual Viewport API for iOS (more reliable)
      const viewport = window.visualViewport;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const keyboardHeight = windowHeight - viewportHeight - viewport.offsetTop;
      
      // Only apply offset if keyboard is actually visible (> 100px threshold)
      const isKeyboardVisible = keyboardHeight > 100;
      
      setKeyboardState({
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? Math.max(0, keyboardHeight) : 0,
        bottomOffset: isKeyboardVisible ? Math.max(0, keyboardHeight) : 0,
      });
    } else {
      // ANDROID & others — do NOT translate the footer.
      // Use visualViewport to compute keyboard height, push padding to content via CSS var.
      const vv = (window as any).visualViewport;
      const keyboardHeight = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      const isKeyboardVisible = keyboardHeight > 100;

      // Expose height to CSS so the scroll container can pad itself
      const offsetValue = isKeyboardVisible ? `${keyboardHeight}px` : '0px';
      document.documentElement.style.setProperty('--kb-offset', offsetValue);
      
      console.log('[Android Keyboard Debug]', {
        keyboardHeight,
        isKeyboardVisible,
        offsetValue,
        appliedToRoot: document.documentElement.style.getPropertyValue('--kb-offset')
      });

      setKeyboardState({
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? keyboardHeight : 0,
        bottomOffset: 0, // Critical: never transform footer on Android
      });
    }
  }, []);

  // Helper to ensure Save button stays visible after iOS keyboard animation
  const ensureSaveButtonVisible = useCallback(() => {
    const saveBar = document.getElementById('form-actions');
    if (!saveBar) return;
    
    // Only scroll if save bar is NOT already visible in viewport
    const rect = saveBar.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    if (!isVisible) {
      setTimeout(() => {
        saveBar.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();

    // Listen to visual viewport changes on all platforms (iOS and Android)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardState);
      window.visualViewport.addEventListener('scroll', updateKeyboardState);
    }

    // Create event handlers
    const handleFocusIn = () => {
      updateKeyboardState();
      if (isIOS) {
        ensureSaveButtonVisible();
      }
    };

    const handleFocusOut = () => {
      updateKeyboardState();
    };

    // Listen to focus events for all platforms
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    
    // Initial check
    updateKeyboardState();

    return () => {
      document.documentElement.style.setProperty('--kb-offset', '0px');
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardState);
        window.visualViewport.removeEventListener('scroll', updateKeyboardState);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, [updateKeyboardState, ensureSaveButtonVisible]);

  return keyboardState;
};
