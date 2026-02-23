/**
 * Health Check API Tests
 * Tests the /api/health endpoint
 */

import { describe, it, expect } from '@jest/globals'

describe('/api/health', () => {
  it('should return 200 status', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    expect(response.status).toBe(200)
  })

  it('should return healthy status', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  it('should include timestamp', async () => {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()
    expect(data.timestamp).toBeDefined()
  })
})
