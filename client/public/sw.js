const BUILD_ID = new URL(self.location.href).searchParams.get('build') || 'dev'
const STATIC_CACHE = `pwa-static-${BUILD_ID}`
const RUNTIME_CACHE = `pwa-runtime-${BUILD_ID}`

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/maskable-icon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      await cache.addAll(STATIC_ASSETS)
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const acceptHeader = request.headers.get('accept') || ''
  const isHTMLRequest = request.mode === 'navigate' || acceptHeader.includes('text/html')

  if (isHTMLRequest) {
    event.respondWith(
      fetch(request).catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }))
    )
    return
  }

  const isStatic =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.svg') ||
      STATIC_ASSETS.includes(url.pathname))

  if (isStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) =>
          cached ||
          fetch(request).then((response) => {
            cache.put(request, response.clone())
            return response
          })
        )
      )
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
        return response
      })
      .catch(() => caches.match(request))
  )
})
