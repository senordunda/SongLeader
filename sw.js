const CACHE_NAME = 'songleader-core-v24';
const SHEET_MUSIC_CACHE = 'songleader-sheets-v1';

// 1. Add the exact relative paths to all your JSON data files here
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './hfw_hymns.json',
  './pftl_hymns.json',
  './phss_hymns.json',
  './sfp_hymns.json',
  './sotc_hymns.json',
  './ss_hymns.json',
  './cloud-sync.js'
];

// Install: Cache core app shell and JSON data
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean up outdated core caches when you bump CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== SHEET_MUSIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Handle offline core files + on-demand sheet music caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip YouTube embeds and non-GET requests
  if (event.request.method !== 'GET' || url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
    return;
  }

  // Strategy A: On-demand caching for external sheet music images
  if (url.origin !== self.location.origin && event.request.destination === 'image') {
    event.respondWith(
      caches.open(SHEET_MUSIC_CACHE).then(async (cache) => {
        const cachedImage = await cache.match(event.request);
        if (cachedImage) return cachedImage;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Return nothing if offline and image wasn't previously viewed
          return new Response('', { status: 408, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // Strategy B1: Network-first for public changelog so updates surface promptly
  if (url.origin === self.location.origin && url.pathname === '/changelog.html') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Strategy B2: Cache-first for local app files & JSON data
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});