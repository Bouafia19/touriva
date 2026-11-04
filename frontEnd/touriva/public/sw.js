/**
 * Touriva Progressive Web App — Production Service Worker
 * Version: touriva-pwa-v1.0.0
 * 
 * Safety Guarantees:
 * - Strictly bypasses and NEVER caches authenticated API requests, tokens, or dynamic travel bookings
 * - Network-first navigation with graceful offline fallback
 * - Safe cache versioning and obsolete cache cleanup
 * - Background revalidation for static icons, fonts, and brand assets
 */

const CACHE_VERSION = 'touriva-pwa-v1.0.4';
const STATIC_CACHE = `touriva-static-${CACHE_VERSION}`;
const ASSETS_CACHE = `touriva-assets-${CACHE_VERSION}`;
const IMAGES_CACHE = `touriva-images-${CACHE_VERSION}`;
const OFFLINE_CACHE = `touriva-offline-${CACHE_VERSION}`;

// Pre-cached core application shell and offline assets
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/logo.png',
  '/logo.svg',
  '/logo-dark.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

// Install: Cache application shell & offline fallback page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use individual puts with try-catch to ensure install does not fail if an asset is missing
      for (const url of PRECACHE_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.ok) {
            await cache.put(url, response);
          }
        } catch (e) {
          console.warn(`[Touriva SW] Failed to pre-cache ${url}:`, e);
        }
      }
    })
  );
});

// Activate: Clean up obsolete caches and claim clients
self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([STATIC_CACHE, ASSETS_CACHE, IMAGES_CACHE, OFFLINE_CACHE]);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('touriva-') && !allowedCaches.has(name)) {
            console.log(`[Touriva SW] Purging obsolete cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING message from update UI prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event handler with strict safety rules
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. CRITICAL API SAFETY: NEVER cache API requests, authentication, or live travel mutation endpoints
  const isApiRequest = url.pathname.startsWith('/api') ||
                       url.hostname.includes('api.touriva') ||
                       url.hostname.includes('touriva-api') ||
                       url.hostname.includes('onrender.com') ||
                       request.headers.has('Authorization');

  if (isApiRequest) {
    // Direct network pass-through — no caching whatsoever
    return;
  }

  // 3. Navigation requests (HTML pages / SPA route navigation)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: try matched cached page, then offline fallback page, then cached SPA shell
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;

          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;

          return new Response('You are offline. Please reconnect to use Touriva.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 4. Vite hashed JS / CSS bundle chunks (/assets/*)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached hashed asset immediately (content-addressed and immutable)
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(ASSETS_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Static Images & Icons (Stale-While-Revalidate)
  const isImageOrFont = /\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);
  if (isImageOrFont || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(IMAGES_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        // Return cached image if available, else wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 6. Generic static files (manifest, favicon, etc.): Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
