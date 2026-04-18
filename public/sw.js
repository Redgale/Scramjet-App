importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// --- PWA ADDITIONS START ---
const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/manifest.json',
  '/sj.png'
];

// Cache assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }));
    })
  );
});
// --- PWA ADDITIONS END ---

async function handleRequest(event) {
    await scramjet.loadConfig();

    // 1. Check if Scramjet handles this route
    if (scramjet.route(event)) {
        return scramjet.fetch(event);
    }

    // 2. If not Scramjet, check the PWA Cache for offline support
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
        return cachedResponse;
    }

    // 3. Otherwise, go to the network
    return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});