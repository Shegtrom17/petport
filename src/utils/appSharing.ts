interface AppShareData {
  title: string;
  text: string;
  url: string;
}

interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'fallback';
  error?: string;
}

export const generateAppShareData = (): AppShareData => {
  return {
    title: "PetPort - Digital Pet Passport",
    text: "Check out PetPort - the digital passport for your pets! Create beautiful profiles, emergency info, and share with caregivers.",
    url: window.location.origin
  };
};

export const shareApp = async (customData?: Partial<AppShareData>): Promise<ShareResult> => {
  const shareData = { ...generateAppShareData(), ...customData };
  
  // Try native sharing first (mobile devices)
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'native', error: 'User cancelled' };
      }
      console.warn('Native sharing failed:', error);
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareData.url);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    console.error('Clipboard failed:', error);
    return { 
      success: false, 
      method: 'fallback', 
      error: 'Sharing not supported on this device' 
    };
  }
};

export const sharePetPortViaEmail = (recipientEmail?: string): void => {
  const shareData = generateAppShareData();
  const subject = encodeURIComponent(shareData.title);
  const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
  const to = recipientEmail ? `?to=${encodeURIComponent(recipientEmail)}&` : '?';
  window.open(`mailto:${to}subject=${subject}&body=${body}`, '_blank');
};

export const sharePetPortViaSMS = (phoneNumber?: string): void => {
  const shareData = generateAppShareData();
  const text = encodeURIComponent(`${shareData.text} ${shareData.url}`);
  const smsUrl = phoneNumber 
    ? `sms:${phoneNumber}?body=${text}`
    : `sms:?body=${text}`;
  window.open(smsUrl, '_blank');
};

export const copyAppLinkToClipboard = async (): Promise<boolean> => {
  try {
    const shareData = generateAppShareData();
    await navigator.clipboard.writeText(shareData.url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};