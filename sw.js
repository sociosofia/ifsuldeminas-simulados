const CACHE = 'ifsuldeminas-simulados-v2';
const CORE = [
  './', './index.html', './css/app.css', './js/app.js',
  './js/engine.part01.txt', './js/engine.part02.txt', './js/engine.part03.txt',
  './manifest.webmanifest', './assets/icon.svg',
  './assets/ifc_2026_q03_charge.part01.b64', './assets/ifc_2026_q03_charge.part02.b64',
  './data/manifest.json',
  './data/banco.part01.b64', './data/banco.part02.b64',
  './data/banco.part03a.b64', './data/banco.part03b.b64', './data/banco.part03c.b64', './data/banco.part03d.b64',
  './data/banco.part04.b64',
  './data/banco.part05a.b64', './data/banco.part05b.b64', './data/banco.part05c.b64', './data/banco.part05d.b64',
  './data/banco.part06a.b64', './data/banco.part06b.b64',
  './data/banco.part06c1a.b64', './data/banco.part06c1b1.b64', './data/banco.part06c1b2.b64',
  './data/banco.part06c1b3a.b64', './data/banco.part06c1b3b.b64',
  './data/banco.part06c1b3c1.b64', './data/banco.part06c1b3c2.b64', './data/banco.part06c1b3c3.b64',
  './data/banco.part06c1b4.b64', './data/banco.part06c2.b64', './data/banco.part06d.b64',
  './data/banco.part07.b64', './data/banco.part08.b64'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
  );
});
