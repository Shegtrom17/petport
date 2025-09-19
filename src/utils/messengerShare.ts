interface MessengerShareOptions {
  url: string;
  title?: string;
  text?: string;
}

/**
 * Enhanced Messenger sharing with improved fallback detection
 * Returns whether fallback should be shown
 */
export const shareViaMessenger = async (options: MessengerShareOptions): Promise<boolean> => {
  const { url, title, text } = options;
  
  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile: Try native app intent
    const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(url)}`;
    
    // Track if user left the page (indicating Messenger opened)
    let hasLeft = false;
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        hasLeft = true;
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
    
    try {
      window.location.href = messengerUrl;
      
      // Wait and check if Messenger opened
      return new Promise((resolve) => {
        setTimeout(() => {
          document.removeEventListener('visibilitychange', visibilityHandler);
          resolve(!hasLeft); // Return true if fallback needed
        }, 1500);
      });
      
    } catch (error) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      return true; // Show fallback
    }
  } else {
    // Desktop: Try web messenger
    try {
      const message = text ? `${text} ${url}` : url;
      const messengerWebUrl = `https://www.messenger.com/new?text=${encodeURIComponent(message)}`;
      
      const newWindow = window.open(messengerWebUrl, '_blank');
      
      // Check if popup was blocked or failed
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(!newWindow || newWindow.closed); // Return true if fallback needed
        }, 1000);
      });
      
    } catch (error) {
      return true; // Show fallback
    }
  }
};

/**
 * Copy URL to clipboard with error handling
 */
export const copyToClipboard = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
};