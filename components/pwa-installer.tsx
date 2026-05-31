'use client'

import { useEffect, useState } from 'react'
import { registerServiceWorker, isPushNotificationSupported } from '@/lib/push-notifications'

/**
 * PWA Installer Component
 * Registers service worker and handles PWA installation
 */
export function PWAInstaller() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker on mount
    const initPWA = async () => {
      if (isPushNotificationSupported()) {
        console.log('[PWA] Initializing...')
        
        try {
          const registration = await registerServiceWorker()
          
          if (registration) {
            console.log('[PWA] Service Worker registered successfully')
            setIsInstalled(true)
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New version available')
                    // Optionally show update notification
                  }
                })
              }
            })
          }
        } catch (error) {
          console.error('[PWA] Initialization failed:', error)
        }
      } else {
        console.warn('[PWA] Not supported in this browser')
      }
    }

    initPWA()

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] Running as installed app')
      setIsInstalled(true)
    }

    // Listen for app install event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed')
      setIsInstalled(true)
    })

    return () => {
      window.removeEventListener('appinstalled', () => {})
    }
  }, [])

  // This component doesn't render anything
  return null
}
