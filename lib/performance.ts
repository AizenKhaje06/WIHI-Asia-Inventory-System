/**
 * Performance Optimization Utilities
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          const src = target.dataset.src
          if (src) {
            target.src = src
            target.removeAttribute('data-src')
            observer.unobserve(target)
          }
        }
      })
    },
    {
      rootMargin: '50px',
    }
  )

  observer.observe(img)
  return () => observer.unobserve(img)
}

/**
 * Measure component render performance
 */
export function measurePerformance(componentName: string, callback: () => void) {
  if (typeof window === 'undefined' || !window.performance) {
    callback()
    return
  }

  const startMark = `${componentName}-start`
  const endMark = `${componentName}-end`
  const measureName = `${componentName}-render`

  performance.mark(startMark)
  callback()
  performance.mark(endMark)

  try {
    performance.measure(measureName, startMark, endMark)
    const measure = performance.getEntriesByName(measureName)[0]
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}: ${measure.duration.toFixed(2)}ms`)
    }

    // Clean up marks and measures
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
  } catch (error) {
    console.error('Performance measurement failed:', error)
  }
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  // Check for device memory (Chrome only)
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory && deviceMemory < 4) return true

  // Check for hardware concurrency (number of CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true

  // Check for connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  if (connection) {
    const slowConnections = ['slow-2g', '2g', '3g']
    if (slowConnections.includes(connection.effectiveType)) return true
  }

  return false
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options)
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Optimize animation frame
 */
export function optimizeAnimationFrame(callback: () => void) {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  let rafId: number

  const tick = () => {
    callback()
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
  }
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: Array<() => void>) {
  requestAnimationFrame(() => {
    updates.forEach((update) => update())
  })
}

/**
 * Check if browser supports feature
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false

  switch (feature) {
    case 'webp':
      const canvas = document.createElement('canvas')
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    case 'intersection-observer':
      return 'IntersectionObserver' in window
    case 'service-worker':
      return 'serviceWorker' in navigator
    case 'backdrop-filter':
      return CSS.supports('backdrop-filter', 'blur(10px)')
    default:
      return false
  }
}

/**
 * Memory-efficient data pagination
 */
export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  return { startIndex, endIndex }
}
