// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDz84C1uArcWCy_8mq4t9ZG0Nym4CegZvM",
  authDomain: "sales-tracking-b2ac5.firebaseapp.com",
  projectId: "sales-tracking-b2ac5",
  storageBucket: "sales-tracking-b2ac5.firebasestorage.app",
  messagingSenderId: "544730100546",
  appId: "1:544730100546:web:bc4890ac5e6f1c5c494edb",
  measurementId: "G-SQDFMGRR6Q"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'New notification'
  const notificationBody = payload.notification?.body || ''
  
  // Get link from data payload (for system notifications)
  const notificationData = payload.data || {}
  const link = notificationData.link || '/'
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: notificationData.notification_id || notificationData.id || 'notification',
    data: {
      ...notificationData,
      link: link, // Ensure link is in data
      url: link, // Also add as url for compatibility
    }
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()
  
  // Get link from notification data
  const notificationData = event.notification.data || {}
  const link = notificationData.link || notificationData.url || '/dashboard'
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        // If it's a system notification with a link, navigate to that link
        if (notificationData.type === 'system_notification' && link) {
          // Send message to client to navigate
          client.postMessage({
            type: 'navigate',
            url: link
          })
          return client.focus().then(() => {
            // Also try to navigate using window.location if postMessage doesn't work
            if (client.navigate) {
              return client.navigate(link)
            }
          })
        }
        // Otherwise, just focus existing window
        if (client.url && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab with the link
      if (clients.openWindow) {
        return clients.openWindow(link)
      }
    })
  )
})

