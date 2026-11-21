const CACHE_NAME = "sound-sense-awakening-v7";
const CORE_FILES = [
  "./",
  "index.html",
  "start.html",
  "learn.html",
  "me.html",
  "login.html",
  "student.css",
  "yx-theme.css",
  "yx-theme.js",
  "yx-cloud.js",
  "yx-shell.js",
  "yx-motion.js",
  "training.html",
  "rhythm-training.html",
  "metronome.html",
  "styles.css",
  "guide-styles.css",
  "theme.css",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
