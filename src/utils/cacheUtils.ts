/**
 * Cache management utilities for debugging and cache clearing
 */

export const clearAllCaches = async (): Promise<void> => {
  try {
    console.log('Clearing all caches...');
    
    // Clear Cache API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }
    
    console.log('Cache clearing completed');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

export const clearServiceWorkerCache = async (): Promise<void> => {
  try {
    console.log('Clearing service worker caches...');
    
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      const petportCaches = cacheNames.filter(name => name.startsWith('petport-'));
      
      await Promise.all(
        petportCaches.map(cacheName => {
          console.log(`Deleting petport cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }
    
    console.log('Service worker cache clearing completed');
  } catch (error) {
    console.error('Error clearing service worker caches:', error);
  }
};

export const forceServiceWorkerUpdate = async (): Promise<void> => {
  try {
    console.log('Forcing service worker update...');
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('Service worker update triggered');
      }
    }
  } catch (error) {
    console.error('Error updating service worker:', error);
  }
};

export const resetAppCache = async (): Promise<void> => {
  try {
    console.log('Resetting complete app cache...');
    
    // Clear all caches
    await clearAllCaches();
    
    // Force service worker update
    await forceServiceWorkerUpdate();
    
    // Clear local storage auth data (but keep user preferences)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });
    
    console.log('App cache reset completed');
  } catch (error) {
    console.error('Error resetting app cache:', error);
  }
};

export const getCacheStatus = async (): Promise<{
  cacheNames: string[];
  serviceWorkerStatus: string;
  localStorageKeys: string[];
}> => {
  try {
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    
    let serviceWorkerStatus = 'not supported';
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      serviceWorkerStatus = registration ? 'registered' : 'not registered';
    }
    
    const localStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) localStorageKeys.push(key);
    }
    
    return {
      cacheNames,
      serviceWorkerStatus,
      localStorageKeys
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      serviceWorkerStatus: 'error',
      localStorageKeys: []
    };
  }
};
