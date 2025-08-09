const CACHE_NAME = 'petport-v4';
const urlsToCache = [];

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

  // Bypass SW for preflight/edge functions/non-GET to avoid CORS/preflight issues
  if (isOptions || isSupabaseFunction || isNonGet) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    fetch(req)
      .then((response) => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone)).catch(() => {});
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        return cached || new Response('', { status: 504 });
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