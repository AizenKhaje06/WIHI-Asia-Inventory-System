/**
 * Testing and Quality Assurance Utilities
 */

/**
 * Validate WCAG color contrast
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background)
  const required = level === 'AAA' ? 7 : 4.5

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  }
}

function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

function getLuminance(color: string): number {
  const rgb = hexToRgb(color)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex')
  const isInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
    element.tagName
  )

  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0)
}

/**
 * Validate touch target size (minimum 44x44px)
 */
export function validateTouchTargetSize(element: HTMLElement): {
  passes: boolean
  width: number
  height: number
  minSize: number
} {
  const rect = element.getBoundingClientRect()
  const minSize = 44

  return {
    passes: rect.width >= minSize && rect.height >= minSize,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    minSize,
  }
}

/**
 * Check for proper ARIA labels
 */
export function hasProperAriaLabel(element: HTMLElement): boolean {
  const ariaLabel = element.getAttribute('aria-label')
  const ariaLabelledBy = element.getAttribute('aria-labelledby')
  const ariaDescribedBy = element.getAttribute('aria-describedby')
  const title = element.getAttribute('title')
  const alt = element.getAttribute('alt')

  return !!(ariaLabel || ariaLabelledBy || ariaDescribedBy || title || alt)
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  start(label: string) {
    this.marks.set(label, performance.now())
  }

  end(label: string): number | null {
    const startTime = this.marks.get(label)
    if (!startTime) return null

    const duration = performance.now() - startTime
    this.marks.delete(label)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  measure(label: string, fn: () => void): number {
    this.start(label)
    fn()
    return this.end(label) || 0
  }

  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label)
    await fn()
    return this.end(label) || 0
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} | null {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null
  }

  const memory = (performance as any).memory
  const used = memory.usedJSHeapSize / 1048576 // Convert to MB
  const total = memory.jsHeapSizeLimit / 1048576

  return {
    used: Math.round(used * 100) / 100,
    total: Math.round(total * 100) / 100,
    percentage: Math.round((used / total) * 100),
  }
}

/**
 * Network quality detection
 */
export function getNetworkQuality(): {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
} | null {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  if (!connection) return null

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  }
}

/**
 * Browser compatibility check
 */
export function checkBrowserCompatibility(): {
  browser: string
  version: string
  isSupported: boolean
  missingFeatures: string[]
} {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let version = 'Unknown'

  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox'
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome'
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari'
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge'
    version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
  }

  // Check for required features
  const missingFeatures: string[] = []

  if (!('IntersectionObserver' in window)) {
    missingFeatures.push('IntersectionObserver')
  }
  if (!('serviceWorker' in navigator)) {
    missingFeatures.push('Service Worker')
  }
  if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
    missingFeatures.push('Backdrop Filter')
  }
  if (!('ResizeObserver' in window)) {
    missingFeatures.push('ResizeObserver')
  }

  return {
    browser,
    version,
    isSupported: missingFeatures.length === 0,
    missingFeatures,
  }
}

/**
 * Accessibility audit
 */
export function runAccessibilityAudit(container: HTMLElement = document.body): {
  issues: Array<{ type: string; element: HTMLElement; message: string }>
  score: number
} {
  const issues: Array<{ type: string; element: HTMLElement; message: string }> = []

  // Check for images without alt text
  const images = container.querySelectorAll('img')
  images.forEach((img) => {
    if (!img.getAttribute('alt')) {
      issues.push({
        type: 'missing-alt',
        element: img,
        message: 'Image missing alt attribute',
      })
    }
  })

  // Check for buttons without accessible labels
  const buttons = container.querySelectorAll('button')
  buttons.forEach((button) => {
    if (!hasProperAriaLabel(button) && !button.textContent?.trim()) {
      issues.push({
        type: 'missing-label',
        element: button,
        message: 'Button missing accessible label',
      })
    }
  })

  // Check for links without accessible labels
  const links = container.querySelectorAll('a')
  links.forEach((link) => {
    if (!hasProperAriaLabel(link) && !link.textContent?.trim()) {
      issues.push({
        type: 'missing-label',
        element: link,
        message: 'Link missing accessible label',
      })
    }
  })

  // Check for form inputs without labels
  const inputs = container.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    const hasLabel = id && container.querySelector(`label[for="${id}"]`)
    const hasAriaLabel = hasProperAriaLabel(input as HTMLElement)

    if (!hasLabel && !hasAriaLabel) {
      issues.push({
        type: 'missing-label',
        element: input as HTMLElement,
        message: 'Form input missing label',
      })
    }
  })

  // Calculate score (100 - number of issues)
  const score = Math.max(0, 100 - issues.length * 5)

  return { issues, score }
}
