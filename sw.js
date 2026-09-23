/**
 * ============================================================================
 * PROPIEDAD INTELECTUAL Y TÉRMINOS DE USO NO COMERCIAL
 * ============================================================================
 * Copyright (c) 2026 Mitzi Rios. Todos los derechos reservados.
 * 
 * Este código fuente se proporciona exclusivamente con fines educativos,
 * demostrativos y de consulta personal.
 * 
 * QUEDA ESTRICTAMENTE PROHIBIDO:
 * - El uso comercial, venta, sublicenciamiento o monetización de este código.
 * - La inclusión de este código en aplicaciones o servicios con fines de lucro.
 * 
 * NON-COMMERCIAL LICENSE NOTICE:
 * This source code is provided strictly for educational and portfolio purposes.
 * Commercial use, monetization, or distribution for financial gain is NOT allowed.
 * ============================================================================
 */

const CACHE_NAME = 'running-app-0-to-5k-v4';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles/variables.css',
  './src/styles/base.css',
  './src/styles/components.css',
  './src/styles/screens.css',
  './src/data/training-plan.js',
  './src/utils/time.js',
  './src/utils/dates.js',
  './src/utils/metrics.js',
  './src/services/storage-service.js',
  './src/services/workout-service.js',
  './src/state/app-state.js',
  './src/state/session-state.js',
  './src/app.js',
  './src/img/android-chrome-192x192.png',
  './src/img/android-chrome-512x512.png',
  './src/img/apple-touch-icon.png',
  './src/img/favicon-16x16.png',
  './src/img/favicon-32x32.png',
  './src/img/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('running-app-0-to-5k-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request)),
  );
});
