/**
 * Production Monitoring & Error Tracking
 * 
 * This module provides error tracking and performance monitoring
 * Ready for integration with Sentry, LogRocket, or similar services
 */

interface ErrorContext {
  user?: {
    id: string
    username: string
    role: string
  }
  page?: string
  action?: string
  metadata?: Record<string, any>
}

class MonitoringService {
  private isProduction = process.env.NODE_ENV === 'production'
  private isEnabled = process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true'

  /**
   * Log an error with context
   */
  logError(error: Error, context?: ErrorContext) {
    if (!this.isEnabled) {
      console.error('[Monitoring] Error:', error, context)
      return
    }

    // In production, send to error tracking service
    if (this.isProduction) {
      // TODO: Integrate with Sentry
      // Sentry.captureException(error, { contexts: context })
      
      // For now, log to console
      console.error('[Production Error]', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.error('[Dev Error]', error, context)
    }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: ErrorContext) {
    if (!this.isEnabled) {
      console.warn('[Monitoring] Warning:', message, context)
      return
    }

    if (this.isProduction) {
      // TODO: Integrate with monitoring service
      console.warn('[Production Warning]', {
        message,
        context,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.warn('[Dev Warning]', message, context)
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('[Monitoring] Event:', eventName, properties)
      return
    }

    if (this.isProduction) {
      // TODO: Integrate with analytics service
      // analytics.track(eventName, properties)
      
      console.log('[Production Event]', {
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    this.trackEvent('page_view', {
      page,
      ...properties,
    })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    if (!this.isEnabled) return

    if (this.isProduction) {
      console.log('[Performance]', {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: { id: string; username: string; role: string }) {
    if (!this.isEnabled) return

    if (this.isProduction) {
      // TODO: Set user context in monitoring service
      // Sentry.setUser({ id: user.id, username: user.username })
      console.log('[Monitoring] User context set:', user.username)
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext() {
    if (!this.isEnabled) return

    if (this.isProduction) {
      // TODO: Clear user context in monitoring service
      // Sentry.setUser(null)
      console.log('[Monitoring] User context cleared')
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService()

// Convenience functions
export const logError = (error: Error, context?: ErrorContext) => 
  monitoring.logError(error, context)

export const logWarning = (message: string, context?: ErrorContext) => 
  monitoring.logWarning(message, context)

export const trackEvent = (eventName: string, properties?: Record<string, any>) => 
  monitoring.trackEvent(eventName, properties)

export const trackPageView = (page: string, properties?: Record<string, any>) => 
  monitoring.trackPageView(page, properties)

export const trackPerformance = (metric: string, value: number, unit?: string) => 
  monitoring.trackPerformance(metric, value, unit)

export const setUserContext = (user: { id: string; username: string; role: string }) => 
  monitoring.setUserContext(user)

export const clearUserContext = () => 
  monitoring.clearUserContext()
