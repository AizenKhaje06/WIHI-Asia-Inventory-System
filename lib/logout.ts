/**
 * Clean Logout Utility
 * Handles complete logout process without conflicts
 */

// Use sessionStorage to persist logout state across redirects
const LOGOUT_FLAG_KEY = '__logout_in_progress__'

/**
 * Check if logout is in progress
 * Uses sessionStorage to persist across page reloads
 */
export function isLogoutInProgress(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(LOGOUT_FLAG_KEY) === 'true'
}

/**
 * Set logout in progress flag
 */
function setLogoutInProgress(value: boolean): void {
  if (typeof window === 'undefined') return
  if (value) {
    sessionStorage.setItem(LOGOUT_FLAG_KEY, 'true')
  } else {
    sessionStorage.removeItem(LOGOUT_FLAG_KEY)
  }
}

/**
 * Perform complete logout
 * Clears all session data and redirects to login
 */
export async function performLogout(): Promise<void> {
  try {
    console.log('[Logout] Starting logout process...')
    
    // Set logout flag FIRST to prevent getCurrentUser from returning data
    // This persists across page reloads via sessionStorage
    setLogoutInProgress(true)

    // Step 1: Clear ALL localStorage items
    if (typeof window !== 'undefined') {
      // Get all keys first
      const allKeys = Object.keys(localStorage)
      
      // Remove all keys
      allKeys.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Also clear the entire storage
      localStorage.clear()

      console.log('[Logout] LocalStorage cleared completely')
    }

    // Step 2: Clear sessionStorage EXCEPT logout flag
    if (typeof window !== 'undefined') {
      // Save logout flag
      const logoutFlag = sessionStorage.getItem(LOGOUT_FLAG_KEY)
      
      // Clear everything
      sessionStorage.clear()
      
      // Restore logout flag
      if (logoutFlag) {
        sessionStorage.setItem(LOGOUT_FLAG_KEY, logoutFlag)
      }
      
      console.log('[Logout] SessionStorage cleared (logout flag preserved)')
    }

    // Step 3: Call logout API (optional, for server-side cleanup)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.warn('[Logout] API call failed, continuing:', error)
    }

    // Step 4: Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    
    // Step 5: Force complete page reload to login
    console.log('[Logout] Forcing complete reload...')
    
    // Use location.replace to prevent back button issues
    window.location.replace(`/?logout=${Date.now()}`)
    
  } catch (error) {
    console.error('[Logout] Error during logout:', error)
    // Force redirect even if there's an error
    window.location.replace('/')
  }
}
