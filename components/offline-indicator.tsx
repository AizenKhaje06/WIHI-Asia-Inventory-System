"use client"

import { useOffline } from "@/hooks/use-offline"
import { WifiOff, Wifi, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export function OfflineIndicator() {
  const { isOnline, syncStatus, lastSyncTime, sync } = useOffline()

  if (isOnline && syncStatus === 'idle') {
    return null // Don't show anything when online and idle
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {!isOnline && <WifiOff className="h-5 w-5 text-red-600" />}
            {isOnline && syncStatus === 'syncing' && (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            {isOnline && syncStatus === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {isOnline && syncStatus === 'error' && (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isOnline && syncStatus === 'idle' && (
              <Wifi className="h-5 w-5 text-green-600" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex-1">
            {!isOnline && (
              <>
                <p className="font-semibold text-sm">You're offline</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Changes will sync when you're back online
                </p>
              </>
            )}
            {isOnline && syncStatus === 'syncing' && (
              <>
                <p className="font-semibold text-sm">Syncing...</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Uploading your changes
                </p>
              </>
            )}
            {isOnline && syncStatus === 'success' && (
              <>
                <p className="font-semibold text-sm text-green-600">Synced!</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  All changes saved
                </p>
              </>
            )}
            {isOnline && syncStatus === 'error' && (
              <>
                <p className="font-semibold text-sm text-red-600">Sync failed</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Please try again
                </p>
              </>
            )}
          </div>

          {/* Action Button */}
          {isOnline && syncStatus !== 'syncing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={sync}
              className="flex-shrink-0"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
          )}
        </div>

        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last synced {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
