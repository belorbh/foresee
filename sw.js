// Foresee · service worker: abre rápido e funciona com internet fraca.
// Arquivos do app: tenta a rede primeiro (sempre a versão nova) e usa a cópia guardada se cair a internet.
// Dados (Supabase) nunca são guardados aqui.
// Só mexe nos caches que começam com "foresee-" (o site pode ter outros apps no mesmo endereço).
const CACHE = 'foresee-v1.5.1';
const ARQUIVOS = ['./', './index.html', './styles.css?v=1.5.1', './app.js?v=1.5.1', './config.js?v=1.5.1', './manifest.webmanifest', './icon.svg', './icon-192.png'];

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

// Notificação de venda
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Foresee', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Foresee', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag, data: { url: d.url || './#/vendas' }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alvo = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) {
      if (c.url.startsWith(self.registration.scope)) { if (c.navigate) c.navigate(alvo).catch(() => {}); return c.focus(); }
    }
    return self.clients.openWindow(alvo);
  }));
});
