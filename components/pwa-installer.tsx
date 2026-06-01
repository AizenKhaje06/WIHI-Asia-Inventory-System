'use client'

import { useEffect, useState } from 'react'

/**
 * PWA Installer Component
 * Registers service worker and handles PWA installation
 */
export function PWAInstaller() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Register service worker on mount
    const initPWA = async () => {
      // Check if push notifications are supported
      const isSupported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window

      if (isSupported) {
        console.log('[PWA] Initializing...')
        
        try {
          // Register service worker
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/'
            })
            
            console.log('[PWA] Service Worker registered successfully')
            setIsInstalled(true)
            
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready
            
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
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] Running as installed app')
      setIsInstalled(true)
    }

    // Listen for app install event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      setIsInstalled(true)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // This component doesn't render anything
  return null
}
