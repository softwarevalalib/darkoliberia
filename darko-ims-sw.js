const CACHE_NAME = "darko-ims-shell-v2";
const APP_URL = "./index.html";
const SHELL = [APP_URL, "./darko-ims.webmanifest", "./darko-ims-icon.svg", "./darko-ims-icon-192.png", "./darko-ims-icon-512.png", "./apple-touch-icon-180.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("darko-ims-") && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(APP_URL, response.clone()));
      return response;
    }).catch(() => caches.match(APP_URL)));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
