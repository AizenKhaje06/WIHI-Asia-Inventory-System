/**
 * Session Guard Hook
 * 
 * Periodically validates the user's session to ensure they're not logged in elsewhere.
 * Automatically logs out the user if their session becomes invalid.
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const SESSION_CHECK_INTERVAL = 30000 // Check every 30 seconds

export function useSessionGuard() {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const username = localStorage.getItem('username')
    const sessionId = localStorage.getItem('sessionId')

    // Skip if not logged in or no session ID
    if (!username || !sessionId) return

    console.log('[Session Guard] Starting session monitoring for:', username)

    // Validate session immediately
    validateSession(username, sessionId)

    // Then validate periodically
    intervalRef.current = setInterval(() => {
      validateSession(username, sessionId)
    }, SESSION_CHECK_INTERVAL)

    return () => {
      if (intervalRef.current) {
        console.log('[Session Guard] Stopping session monitoring')
        clearInterval(intervalRef.current)
      }
    }
  }, [router])

  async function validateSession(username: string, sessionId: string) {
    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sessionId })
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        console.log('[Session Guard] Session invalid, logging out...')
        
        // Clear all local storage
        localStorage.clear()
        
        // Show message
        toast.error('Your account has been logged in on another device. You have been logged out.')
        
        // Redirect to login
        router.push('/?logout=session_invalid')
      }
    } catch (error) {
      console.error('[Session Guard] Error validating session:', error)
      // Don't logout on network errors, just log
    }
  }
}
