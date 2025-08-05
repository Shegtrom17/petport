
export const cleanupAuthState = () => {
  console.log("Cleaning up auth state...");
  
  // Remove all localStorage keys that might contain auth data or pet selection
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'selectedPetId')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage if it exists
  if (typeof sessionStorage !== 'undefined') {
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
        sessionKeysToRemove.push(key);
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    });
  }
  
  console.log("Auth state cleanup completed");
};
