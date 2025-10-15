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
      // Fallback for Android and other platforms
      const activeElement = document.activeElement as HTMLElement;
      const isInputFocused = activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.contentEditable === 'true');
      
      // More accurate keyboard height estimation based on screen size
      const estimateKeyboardHeight = () => {
        if (!isInputFocused) return 0;
        const screenHeight = window.innerHeight;
        // Tablets have larger keyboards
        if (screenHeight > 1024) return 380;
        // Large phones
        if (screenHeight > 800) return 320;
        // Standard phones
        return 280;
      };
      
      const estimatedHeight = estimateKeyboardHeight();
      
      // Only apply offset if keyboard should be visible
      setKeyboardState({
        isVisible: isInputFocused && estimatedHeight > 100,
        height: estimatedHeight,
        bottomOffset: estimatedHeight > 100 ? estimatedHeight : 0,
      });
    }
  }, []);

  // Helper to ensure Save button stays visible after iOS keyboard animation
  const ensureSaveButtonVisible = useCallback(() => {
    const saveBar = document.getElementById('form-actions');
    if (!saveBar) return;
    
    // Wait for iOS keyboard animation to complete (typically 300ms)
    setTimeout(() => {
      saveBar.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIOS = isIOSDevice();

    if (isIOS && window.visualViewport) {
      // Listen to visual viewport changes (iOS)
      window.visualViewport.addEventListener('resize', updateKeyboardState);
      window.visualViewport.addEventListener('scroll', updateKeyboardState);
    }

    // Create event handlers
    const handleFocusIn = () => {
      updateKeyboardState();
      ensureSaveButtonVisible();
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
