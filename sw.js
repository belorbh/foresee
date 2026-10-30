// Foresee · service worker: abre rápido e funciona com internet fraca.
// Arquivos do app: tenta a rede primeiro (sempre a versão nova) e usa a cópia guardada se cair a internet.
// Dados (Supabase) nunca são guardados aqui.
// Só mexe nos caches que começam com "foresee-" (o site pode ter outros apps no mesmo endereço).
const CACHE = 'foresee-v1.2.0';
const ARQUIVOS = ['./', './index.html', './styles.css?v=1.2.0', './app.js?v=1.2.0', './config.js?v=1.2.0', './manifest.webmanifest', './icon.svg', './icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('foresee-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const doApp = url.origin === self.location.origin;
  const biblioteca = url.hostname === 'cdn.jsdelivr.net';
  if (!doApp && !biblioteca) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: false }).then((r) => r || caches.match('./index.html')))
  );
});
