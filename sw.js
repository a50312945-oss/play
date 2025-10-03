// v3 service worker: force update
const CACHE = 'photoppt-mobile-inline-v3';
const CORE = ['.', './index.html?v=3', './index.html', './app.js?v=3', './app.js', './manifest.webmanifest?v=3', './manifest.webmanifest'];
self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin){
    // cache-first for our core files
    e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(r=> r || fetch(e.request)));
  }
});