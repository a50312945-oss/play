// Simple service worker to cache core files for quicker loads
const CACHE = 'photoppt-mobile-v1';
const CORE = ['.', './index.html', './app.js', './manifest.webmanifest'];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (CORE.includes(url.pathname) || url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});