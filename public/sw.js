const CACHE_NAME = 'petport-v11'; // iOS optimized cache management
const urlsToCache = [];

// iOS detection
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      if (urlsToCache.length > 0) {
        try {
          await cache.addAll(urlsToCache);
        } catch (err) {
          console.warn('SW: Precache skipped due to missing assets', err);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
          return Promise.resolve(false);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;
  const isSupabaseFunction = url.includes('supabase.co/functions');
  const isOptions = req.method === 'OPTIONS';
  const isNonGet = req.method !== 'GET';
  const isCrossOrigin = !url.startsWith(self.location.origin);
  
  // Never cache PDFs or dynamic share routes for fresh content
  const isPdfRequest = req.headers.get('accept')?.includes('application/pdf') || url.includes('.pdf');
  const isShareRoute = url.includes('/public/') || url.includes('/share/');

  // Bypass SW for preflight/edge functions/non-GET/cross-origin/PDFs/shares to avoid CORS issues and ensure fresh content
  if (isOptions || isSupabaseFunction || isNonGet || isCrossOrigin || isPdfRequest || isShareRoute) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        // iOS-optimized caching strategy
        if (isIOS()) {
          // For iOS, be more conservative with caching to prevent memory issues
          const cached = await cache.match(req);
          
          // Try network first but with shorter timeout on iOS
          let networkPromise;
          try {
            const hasTimeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function';
            if (hasTimeout) {
              networkPromise = fetch(req, { signal: AbortSignal.timeout(5000) });
            } else {
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), 5000);
              networkPromise = fetch(req, { signal: controller.signal }).finally(() => clearTimeout(id));
            }
          } catch (e) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            networkPromise = fetch(req, { signal: controller.signal }).finally(() => clearTimeout(id));
          }
          
          try {
            const networkResponse = await networkPromise;
            
            // Only cache smaller responses on iOS to prevent memory pressure
            if (networkResponse.ok && 
                networkResponse.headers.get('content-length') && 
                parseInt(networkResponse.headers.get('content-length') || '0') < 1024 * 1024) { // 1MB limit
              cache.put(req, networkResponse.clone());
            }
            
            return networkResponse;
          } catch (networkError) {
            // Fallback to cache on iOS if available
            if (cached) {
              return cached;
            }
            throw networkError;
          }
        } else {
          // Standard caching for non-iOS devices
          const networkResponse = await fetch(req);
          
          if (networkResponse.ok) {
            cache.put(req, networkResponse.clone());
          }
          
          return networkResponse;
        }
      } catch (error) {
        // Fallback to cache if network fails
        const cached = await cache.match(req);
        if (cached) {
          return cached;
        }
        
        // Return offline page or generic error for HTML requests
        if (req.headers.get('accept')?.includes('text/html')) {
          return new Response('<!DOCTYPE html><html><body><h1>Offline</h1><p>Please check your connection and try again.</p></body></html>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        return new Response('', { status: 504 });
      }
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/lovable-uploads/cf53d42e-8ff9-415e-aec0-6f30ee19edef.png',
    badge: '/lovable-uploads/cf53d42e-8ff9-415e-aec0-6f30ee19edef.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('PetPort', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});