const CACHE_NAME = 'petport-v13'; // iOS optimized cache management
const urlsToCache = [
  '/',
  '/lovable-uploads/213ccabc-3918-406d-b844-9c2730b7637d.png', // PetPort logo
];

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
  const urlObj = new URL(req.url);
  const isSupabaseFunction = urlObj.hostname.includes('supabase.co') && urlObj.pathname.includes('/functions');
  const isOptions = req.method === 'OPTIONS';
  const isNonGet = req.method !== 'GET';
  const isCrossOrigin = urlObj.origin !== self.location.origin;
  const isNavigation = req.mode === 'navigate' || req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  // Avoid caching PDFs or dynamic share routes
  const isPdfRequest = req.headers.get('accept')?.includes('application/pdf') || urlObj.pathname.endsWith('.pdf');
  const isShareRoute = urlObj.pathname.includes('/public/') || urlObj.pathname.includes('/share/');

  // Bypass SW for preflight/edge functions/non-GET/cross-origin/PDFs/shares
  if (isOptions || isSupabaseFunction || isNonGet || isCrossOrigin || isPdfRequest || isShareRoute) {
    event.respondWith(fetch(req));
    return;
  }

  // Never intercept critical resources aggressively; let the browser handle
  const criticalDestinations = ['script', 'style', 'font'];
  if (criticalDestinations.includes(req.destination)) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        // Special handling for navigations (index.html/app shell)
        if (isNavigation) {
          try {
            const networkResponse = await fetch(req); // no timeout for navigations to avoid blank screens
            if (networkResponse.ok) {
              cache.put('/', networkResponse.clone());
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          } catch (e) {
            // Fallback to cached shell
            const cachedIndex = (await cache.match(req)) || (await cache.match('/'));
            if (cachedIndex) return cachedIndex;
            return new Response('<!DOCTYPE html><html><body><h1>Offline</h1><p>Please check your connection and try again.</p></body></html>', {
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            });
          }
        }

        // iOS-friendly caching for other assets
        const cached = await cache.match(req);
        if (cached) return cached;

        const response = await fetch(req);
        if (response.ok) {
          // Only cache smaller responses on iOS to prevent memory pressure
          if (!isIOS()) {
            cache.put(req, response.clone());
          } else {
            const len = parseInt(response.headers.get('content-length') || '0');
            if (len && len < 1024 * 1024) {
              cache.put(req, response.clone());
            }
          }
        }
        return response;
      } catch (error) {
        const cached = await cache.match(req);
        if (cached) return cached;
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