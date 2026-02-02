"use client"

import { useState, useEffect } from 'react'

/**
 * SSR-safe localStorage hook with hydration protection
 * Prevents hydration mismatches by only accessing localStorage after mount
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
    }
  }, [key])

  // Save to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isHydrated]
}

/**
 * Simple localStorage getter with SSR safety
 */
export function getLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
    return null
  }
}

/**
 * Simple localStorage setter with SSR safety
 */
export function setLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error)
  }
}

/**
 * Simple localStorage remover with SSR safety
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}
