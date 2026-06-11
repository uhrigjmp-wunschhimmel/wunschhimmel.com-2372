// Wunschhimmel Service Worker
// Minimal – nur für PWA-Fähigkeit (Share Target benötigt SW)

const CACHE_NAME = "wunschhimmel-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Netzwerk-first: App funktioniert immer online
self.addEventListener("fetch", (event) => {
  // Nur GET-Requests cachen
  if (event.request.method !== "GET") return;

  // API-Calls nie cachen
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});
