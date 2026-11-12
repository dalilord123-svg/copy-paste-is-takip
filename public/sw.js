const CACHE_NAME = "copy-paste-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Development sırasında cache kullanma
});