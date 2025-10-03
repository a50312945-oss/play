// Cache core for offline-ish use
const CACHE = 'photoppt-mobile-inline-v2';
const CORE = ['.', './index.html', './app.js', './manifest.webmanifest'];
self.addEventListener('install', e=> e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate', e=> e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin) e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
