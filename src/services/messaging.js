import { getFCMToken, requestNotificationPermission, onMessageListener } from './firebase'
import { dashboardAPI } from './api'

class MessagingService {
  constructor() {
    this.token = null
    this.isInitialized = false
  }

  // Initialize messaging service (with user interaction)
  async initialize() {
    try {
      // IMPORTANT: Request permission FIRST, directly from user interaction
      // This must happen synchronously in response to the user click
      if (!('Notification' in window)) {
        throw new Error('Notifications are not supported in this browser')
      }

      // Check current permission
      let permission = Notification.permission
      console.log('Current permission before request:', permission)

      // Request permission if not already granted/denied
      if (permission === 'default') {
        console.log('Requesting notification permission NOW...')
        // This MUST be called directly from user interaction
        permission = await Notification.requestPermission()
        console.log('Permission result:', permission)
      }

      if (permission !== 'granted') {
        throw new Error(`Permission not granted. Status: ${permission}`)
      }

      // Now get the FCM token (after permission is granted)
      const { requestNotificationPermission } = await import('./firebase')
      this.token = await requestNotificationPermission()
      
      if (this.token) {
        console.log('FCM Token obtained:', this.token.substring(0, 20) + '...')
        
        // Send token to backend to associate with admin user
        await this.sendTokenToBackend(this.token)
        
        // Set up foreground message listener
        this.setupForegroundListener()
        
        this.isInitialized = true
        return true
      } else {
        console.warn('Failed to get FCM token - permission may have been denied')
        return false
      }
    } catch (error) {
      console.error('Error initializing messaging:', error)
      throw error
    }
  }

  // Try to get existing token without requesting permission
  async tryGetExistingToken() {
    if (this.isInitialized && this.token) {
      return this.token
    }

    try {
      // Check if permission is already granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const { getFCMToken } = await import('./firebase')
        this.token = await getFCMToken()
        
        if (this.token) {
          // Send token to backend
          await this.sendTokenToBackend(this.token)
          // Set up foreground message listener
          this.setupForegroundListener()
          this.isInitialized = true
          return this.token
        }
      }
      return null
    } catch (error) {
      console.error('Error getting existing FCM token:', error)
      return null
    }
  }

  // Send FCM token to backend
  async sendTokenToBackend(token) {
    try {
      // Call backend API to save/update FCM token for admin
      await dashboardAPI.updateFCMToken(token)
      console.log('FCM token sent to backend successfully')
    } catch (error) {
      console.error('Error sending FCM token to backend:', error)
    }
  }

  // Set up listener for foreground messages
  setupForegroundListener() {
    onMessageListener()
      .then((payload) => {
        if (payload) {
          this.handleForegroundMessage(payload)
        }
      })
      .catch((error) => {
        console.error('Error in message listener:', error)
      })
  }

  // Handle foreground messages (when app is open)
  handleForegroundMessage(payload) {
    console.log('Foreground message received:', payload)
    
    // Check if this is a system notification
    const isSystemNotification = payload.data?.type === 'system_notification'
    const notificationLink = payload.data?.link
    
    // Show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.notification?.title || 'New notification', {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.notification_id || payload.data?.id || 'notification',
        data: payload.data || {},
      })
      
      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // Navigate to link if it's a system notification with a link
        if (isSystemNotification && notificationLink && window.location) {
          // Use Vue Router if available
          if (window.Vue && window.Vue.prototype && window.Vue.prototype.$router) {
            const router = window.Vue.prototype.$router
            router.push(notificationLink)
          } else {
            // Fallback to window.location
            window.location.href = notificationLink
          }
        }
      }
    }
    
    // Also show Ant Design message if Vue is available
    if (window.Vue) {
      // Use Vue instance to show message
      const Vue = window.Vue
      if (Vue.prototype && Vue.prototype.$message) {
        Vue.prototype.$message.info({
          content: payload.notification?.title || 'New notification',
          duration: 5,
        })
      }
    }
    
    // Refresh system notifications in header if it's a system notification
    if (isSystemNotification && window.Vue) {
      // Trigger event to refresh notifications in header
      window.dispatchEvent(new CustomEvent('system-notification-received', {
        detail: payload.data
      }))
    }
  }

  // Get current FCM token
  async getToken() {
    if (!this.token) {
      this.token = await getFCMToken()
    }
    return this.token
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  // Check notification permission
  getPermission() {
    if (!('Notification' in window)) {
      return 'not-supported'
    }
    return Notification.permission
  }
}

// Create singleton instance
const messagingService = new MessagingService()

export default messagingService

