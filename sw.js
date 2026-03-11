/* ═══════════════════════════════════════════════════
   Mo Saathi — Service Worker
   Caches the app shell for offline access
═══════════════════════════════════════════════════ */

const CACHE_NAME = 'mo-saathi-v1';

const SHELL_FILES = [
  './index.html',
  './manifest.json'
];

/* ── Install: cache shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: network first, fall back to cache ── */
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin or app shell
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses for shell files
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
