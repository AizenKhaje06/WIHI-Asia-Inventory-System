import { useState, useEffect } from 'react'
import { offlineStorage, syncManager } from '@/lib/offline-storage'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  useEffect(() => {
    // Initialize offline storage
    offlineStorage.init().catch(console.error)

    // Check online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Automatically sync when coming back online
      handleSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load last sync time
    syncManager.getLastSyncTime().then(setLastSyncTime)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline')
      return
    }

    setSyncStatus('syncing')
    try {
      const result = await syncManager.syncToServer()
      console.log('Sync completed:', result)
      setSyncStatus('success')
      const time = await syncManager.getLastSyncTime()
      setLastSyncTime(time)
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  return {
    isOnline,
    syncStatus,
    lastSyncTime,
    sync: handleSync,
    storage: offlineStorage
  }
}
