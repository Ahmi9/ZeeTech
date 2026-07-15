self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Order', {
      body: data.body || '',
      icon: '/brand/ahmi-makes-mark.png',
      badge: '/brand/ahmi-makes-mark.png',
      tag: data.tag,
      data: { url: data.url || '/admin/orders' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin/orders'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
