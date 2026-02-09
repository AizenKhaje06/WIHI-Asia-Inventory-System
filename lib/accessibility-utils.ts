/**
 * Enterprise Accessibility Utilities
 * WCAG 2.1 AA/AAA Compliance
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.getElementById('screen-reader-announcements')
  if (announcement) {
    announcement.setAttribute('aria-live', priority)
    announcement.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      announcement.textContent = ''
    }, 1000)
  }
}

/**
 * Check if element meets WCAG contrast requirements
 */
export function checkContrastRatio(foreground: string, background: string): {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
} {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b]
  }

  // Calculate relative luminance
  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const fgRGB = getRGB(foreground)
  const bgRGB = getRGB(background)
  
  const fgLuminance = getLuminance(fgRGB)
  const bgLuminance = getLuminance(bgRGB)
  
  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  
  const ratio = (lighter + 0.05) / (darker + 0.05)
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,  // Normal text
    passesAAA: ratio >= 7     // Normal text
  }
}

/**
 * Trap focus within a modal/dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstElement?.focus()

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Generate unique ID for form elements
 */
let idCounter = 0
export function generateUniqueId(prefix = 'id'): string {
  idCounter++
  return `${prefix}-${Date.now()}-${idCounter}`
}

/**
 * Keyboard navigation helpers
 */
export const KeyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const

/**
 * Skip to content for keyboard navigation
 */
export function setupSkipLinks() {
  const skipLink = document.querySelector('.skip-to-main') as HTMLAnchorElement
  if (!skipLink) return

  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1')
      mainContent.focus()
      mainContent.removeAttribute('tabindex')
    }
  })
}

/**
 * ARIA live region helpers
 */
export function updateLiveRegion(message: string, type: 'status' | 'alert' = 'status') {
  const region = document.querySelector(`[role="${type}"]`)
  if (region) {
    region.textContent = message
  }
}

/**
 * Focus management
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  save() {
    this.previousFocus = document.activeElement as HTMLElement
  }

  restore() {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus()
    }
  }

  clear() {
    this.previousFocus = null
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Validate form accessibility
 */
export function validateFormAccessibility(formElement: HTMLFormElement): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check all inputs have labels
  const inputs = formElement.querySelectorAll('input, select, textarea')
  inputs.forEach((input) => {
    const id = input.getAttribute('id')
    if (!id) {
      errors.push(`Input missing ID: ${input.getAttribute('name') || 'unknown'}`)
      return
    }

    const label = formElement.querySelector(`label[for="${id}"]`)
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledby = input.getAttribute('aria-labelledby')

    if (!label && !ariaLabel && !ariaLabelledby) {
      errors.push(`Input missing label: ${id}`)
    }
  })

  // Check required fields have aria-required
  const requiredInputs = formElement.querySelectorAll('[required]')
  requiredInputs.forEach((input) => {
    if (!input.getAttribute('aria-required')) {
      errors.push(`Required input missing aria-required: ${input.getAttribute('id') || 'unknown'}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
