/**
 * Push Notification Utility
 * Handles service worker registration and push notification subscriptions
 */

export interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
  channel?: string
  requireInteraction?: boolean
  vibrate?: number[]
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    
    console.log('[Push Notifications] Service Worker registered:', registration)
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready
    
    return registration
  } catch (error) {
    console.error('[Push Notifications] Service Worker registration failed:', error)
    return null
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('[Push Notifications] Permission:', permission)
    return permission
  } catch (error) {
    console.error('[Push Notifications] Permission request failed:', error)
    return 'denied'
  }
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      console.log('[Push Notifications] Already subscribed')
      return subscription
    }

    // For now, we'll use local notifications instead of push notifications
    // Push notifications require VAPID keys from server
    // Local notifications work without server setup
    console.log('[Push Notifications] Using local notifications (no server keys needed)')
    
    return null
  } catch (error) {
    console.error('[Push Notifications] Subscription failed:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      console.log('[Push Notifications] Unsubscribed')
      return true
    }
    
    return false
  } catch (error) {
    console.error('[Push Notifications] Unsubscribe failed:', error)
    return false
  }
}

/**
 * Send subscription to server
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })

    if (!response.ok) {
      throw new Error('Failed to send subscription to server')
    }

    console.log('[Push Notifications] Subscription sent to server')
  } catch (error) {
    console.error('[Push Notifications] Failed to send subscription:', error)
  }
}

/**
 * Show local notification (for testing)
 */
export async function showLocalNotification(data: PushNotificationData): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      tag: data.tag || 'wihi-notification',
      requireInteraction: data.requireInteraction || false,
      // vibrate is non-standard and not in TypeScript's NotificationOptions
      // but supported by some browsers - cast to any to bypass type checking
      ...(data.vibrate && { vibrate: data.vibrate }) as any,
      data: {
        url: data.url || '/packer/dashboard',
        channel: data.channel || 'Unknown'
      },
      actions: [
        {
          action: 'open',
          title: 'View Order'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    })

    console.log('[Push Notifications] Local notification shown')
  } catch (error) {
    console.error('[Push Notifications] Failed to show notification:', error)
  }
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.warn('[Push Notifications] Not supported')
    return false
  }

  try {
    // Register service worker
    const registration = await registerServiceWorker()
    if (!registration) {
      return false
    }

    // Check permission
    const permission = getNotificationPermission()
    if (permission === 'granted') {
      // We're using local notifications, no subscription needed
      console.log('[Push Notifications] Using local notifications')
      return true
    } else if (permission === 'default') {
      // Will request permission when user interacts
      console.log('[Push Notifications] Permission not yet requested')
      return false
    } else {
      console.warn('[Push Notifications] Permission denied')
      return false
    }
  } catch (error) {
    console.error('[Push Notifications] Initialization failed:', error)
    return false
  }
}
