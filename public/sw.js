// Health Tracking Pro Service Worker
const CACHE_NAME = 'health-tracking-pro-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/checklist',
  '/competition',
  '/stats',
  '/settings',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install Event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App Shell Cached');
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate Event');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Active');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network First Strategy for API calls, Cache First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();

          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Return offline fallback for API requests
            return new Response(
              JSON.stringify({
                error: 'Offline - data not available',
                offline: true
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle static assets and pages with Cache First strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If it's a navigation request, return the offline page
        if (request.mode === 'navigate') {
          return caches.match('/');
        }

        // For other requests, return a basic offline response
        return new Response('Offline Content Not Available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Background Sync for offline data submission
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync Event', event.tag);

  if (event.tag === 'checklist-sync') {
    event.waitUntil(syncChecklistData());
  }
});

// Sync checklist data when back online
async function syncChecklistData() {
  try {
    // Get any pending checklist data from IndexedDB or localStorage
    // This would be implemented based on your data storage strategy
    console.log('Service Worker: Syncing offline checklist data');

    // Example sync logic would go here
    // const pendingData = await getPendingChecklistData();
    // if (pendingData.length > 0) {
    //   await submitChecklistData(pendingData);
    //   await clearPendingData();
    // }
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Push notification support (optional)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Event');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Health Tracking Pro notification',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/icon-72x72.svg'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/icon-72x72.svg'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Health Tracking Pro', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click Event');

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Script loaded');