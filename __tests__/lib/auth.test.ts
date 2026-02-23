/**
 * Authentication Tests
 * Tests the auth utility functions
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { hasPermission, ROLES } from '@/lib/auth'

describe('Authentication', () => {
  describe('hasPermission', () => {
    it('admin should have access to all routes', () => {
      expect(hasPermission('admin', '/dashboard')).toBe(true)
      expect(hasPermission('admin', '/dashboard/operations')).toBe(true)
      expect(hasPermission('admin', '/dashboard/pos')).toBe(true)
      expect(hasPermission('admin', '/dashboard/reports')).toBe(true)
      expect(hasPermission('admin', '/dashboard/cancelled-orders')).toBe(true)
      expect(hasPermission('admin', '/dashboard/settings')).toBe(true)
    })

    it('operations should have limited access', () => {
      expect(hasPermission('operations', '/dashboard')).toBe(false)
      expect(hasPermission('operations', '/dashboard/operations')).toBe(true)
      expect(hasPermission('operations', '/dashboard/pos')).toBe(true)
      expect(hasPermission('operations', '/dashboard/reports')).toBe(true)
      expect(hasPermission('operations', '/dashboard/cancelled-orders')).toBe(false)
      expect(hasPermission('operations', '/dashboard/settings')).toBe(false)
    })

    it('should allow access to common routes', () => {
      expect(hasPermission('admin', '/dashboard/inventory')).toBe(true)
      expect(hasPermission('operations', '/dashboard/inventory')).toBe(true)
      expect(hasPermission('admin', '/dashboard/analytics')).toBe(true)
      expect(hasPermission('operations', '/dashboard/analytics')).toBe(true)
    })
  })

  describe('ROLES', () => {
    it('should have admin role defined', () => {
      expect(ROLES.admin).toBeDefined()
      expect(ROLES.admin.name).toBe('Administrator')
    })

    it('should have operations role defined', () => {
      expect(ROLES.operations).toBeDefined()
      expect(ROLES.operations.name).toBe('Operations')
    })
  })
})
