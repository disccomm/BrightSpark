/* --- SERVICE WORKER: OFFINE CAPABILITY --- */
const CACHE_NAME = 'brightspark-v1';

// Assets to cache immediately. 
// NOTE: If you add local images/icons, add their filenames here.
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// 1. INSTALL: Cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting(); 
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Claim clients immediately so the user doesn't have to refresh twice
    return self.clients.claim(); 
});

// 3. FETCH: Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
    // We only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if found
            if (cachedResponse) {
                return cachedResponse;
            }

            // Otherwise, fetch from network
            return fetch(event.request).then((networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Optional: Clone and cache new network requests dynamically
                // (Useful if you add external CDN images later)
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Fallback for when completely offline and resource not cached
                // For a Single Page App, we usually just return index.html, 
                // but since we cached it above, the logic handles it.
                console.log('[Service Worker] Network request failed and no cache available.');
            });
        })
    );
});