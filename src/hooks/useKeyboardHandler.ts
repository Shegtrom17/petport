import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to handle iOS keyboard behavior and prevent viewport jumping
 */
export const useKeyboardHandler = () => {
  const originalViewportHeight = useRef<number>(window.innerHeight);
  const isKeyboardOpen = useRef<boolean>(false);
  const activeElement = useRef<Element | null>(null);

  const isIOSDevice = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  const handleResize = useCallback(() => {
    if (!isIOSDevice()) return;

    const currentHeight = window.innerHeight;
    const heightDifference = originalViewportHeight.current - currentHeight;
    
    // If height decreased by more than 150px, keyboard is likely open
    const keyboardThreshold = 150;
    const keyboardOpenNow = heightDifference > keyboardThreshold;

    if (keyboardOpenNow !== isKeyboardOpen.current) {
      isKeyboardOpen.current = keyboardOpenNow;
      
      if (keyboardOpenNow) {
        // Keyboard opened
        activeElement.current = document.activeElement;
        document.body.classList.add('keyboard-open');
        
        // Prevent viewport scaling by ensuring the focused element stays visible
        // Skip if we're in edit mode on desktop
        const isEditing = document.body.getAttribute('data-editing') === 'true';
        if (activeElement.current && 'scrollIntoView' in activeElement.current && !isEditing) {
          setTimeout(() => {
            (activeElement.current as Element).scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 300);
        }
      } else {
        // Keyboard closed
        document.body.classList.remove('keyboard-open');
        activeElement.current = null;
      }
    }
  }, [isIOSDevice]);

  const handleFocusIn = useCallback((event: FocusEvent) => {
    if (!isIOSDevice()) return;

    const target = event.target as HTMLElement;
    
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      // Store the focused element
      activeElement.current = target;
      
      // Only scroll if element is not fully visible
      // Skip if we're in edit mode on desktop
      const isEditing = document.body.getAttribute('data-editing') === 'true';
      setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible && !isEditing) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }, [isIOSDevice]);

  const handleFocusOut = useCallback(() => {
    if (!isIOSDevice()) return;
    
    // Small delay to handle rapid focus changes
    setTimeout(() => {
      if (!document.activeElement || 
          (document.activeElement.tagName !== 'INPUT' && 
           document.activeElement.tagName !== 'TEXTAREA')) {
        activeElement.current = null;
      }
    }, 100);
  }, [isIOSDevice]);

  useEffect(() => {
    if (!isIOSDevice()) return;

    // Store initial viewport height
    originalViewportHeight.current = window.innerHeight;

    // Add event listeners
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });

    // Add CSS for keyboard open state
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-open {
        position: fixed;
        width: 100%;
      }
      
      .keyboard-open input,
      .keyboard-open textarea {
        transform: none !important;
        transition: none !important;
      }
      
      /* Prevent zoom on input focus for iOS */
      @media screen and (max-width: 767px) {
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="search"],
        input[type="tel"],
        input[type="url"],
        textarea {
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.head.removeChild(style);
      document.body.classList.remove('keyboard-open');
    };
  }, [handleResize, handleFocusIn, handleFocusOut, isIOSDevice]);

  return {
    isKeyboardOpen: isKeyboardOpen.current,
    activeElement: activeElement.current,
    isIOSDevice: isIOSDevice()
  };
};