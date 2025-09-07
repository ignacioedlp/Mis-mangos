const CACHE_NAME = 'better-auth-v1'
const STATIC_CACHE = 'better-auth-static-v1'
const DYNAMIC_CACHE = 'better-auth-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/expenses',
  '/budget',
  '/monthly',
  '/categories',
  '/reports',
  '/offline',
  '/manifest.json',
  '/logo.png'
]

// API routes that can be cached
const CACHEABLE_ROUTES = [
  '/api/auth',
  '/api/expenses',
  '/api/categories',
  '/api/budget'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }
  
  event.respondWith(
    handleRequest(request)
  )
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Static files - Cache First
    if (isStaticFile(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE)
    }
    
    // Strategy 2: API routes - Network First
    if (isApiRoute(url.pathname)) {
      return await networkFirst(request, DYNAMIC_CACHE)
    }
    
    // Strategy 3: Pages - Stale While Revalidate
    if (isPageRoute(url.pathname)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE)
    }
    
    // Default: Network First
    return await networkFirst(request, DYNAMIC_CACHE)
    
  } catch (error) {
    console.error('Request failed:', error)
    return await handleOffline(request)
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName)
      cache.then(c => c.put(request, networkResponse.clone()))
    }
    return networkResponse
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse
  })
  
  return cachedResponse || await fetchPromise
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url)
  
  // Try to find a cached version
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // For page requests, show offline page
  if (isPageRoute(url.pathname)) {
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
  }
  
  // Return a basic offline response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'You are currently offline. Please check your connection.' 
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// Helper functions
function isStaticFile(pathname) {
  return pathname.includes('.') && (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  )
}

function isApiRoute(pathname) {
  return pathname.startsWith('/api/') || 
         CACHEABLE_ROUTES.some(route => pathname.startsWith(route))
}

function isPageRoute(pathname) {
  return !pathname.startsWith('/api/') && 
         !pathname.startsWith('/_next/') &&
         !isStaticFile(pathname)
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncExpenses())
  }
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications())
  }
})

async function syncExpenses() {
  try {
    // Get pending expenses from IndexedDB
    const pendingExpenses = await getPendingExpenses()
    
    for (const expense of pendingExpenses) {
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expense.data)
        })
        
        // Remove from pending after successful sync
        await removePendingExpense(expense.id)
        
      } catch (error) {
        console.error('Failed to sync expense:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

async function syncNotifications() {
  try {
    // Fetch latest notifications
    await fetch('/api/notifications')
  } catch (error) {
    console.error('Failed to sync notifications:', error)
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingExpenses() {
  // TODO: Implement IndexedDB operations
  return []
}

async function removePendingExpense(id) {
  // TODO: Implement IndexedDB operations
  console.log('Remove pending expense:', id)
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }
  
  const data = event.data.json()
  
  const options = {
    body: data.message,
    icon: '/logo.png',
    badge: '/logo.png',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/logo.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/dashboard'
    
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})
