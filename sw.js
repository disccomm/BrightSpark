const CACHE_NAME = 'brightspark-v2';
const ASSETS = [
    './',
    './index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    )));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Cache First strategy
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});