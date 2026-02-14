/**
 * Enterprise Security Utilities
 * Implements JWT, Rate Limiting, Session Management, and 2FA
 */

import { SignJWT, jwtVerify } from 'jose'
import { createHash, randomBytes } from 'crypto'

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
)
const JWT_EXPIRATION = '1h' // 1 hour
const REFRESH_TOKEN_EXPIRATION = '7d' // 7 days

// Rate Limiting Configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 60 * 60 * 1000 // 1 hour
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

// In-memory stores (use Redis in production)
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>()
const sessions = new Map<string, { userId: string; lastActivity: number; deviceInfo: string }>()
const refreshTokens = new Map<string, { userId: string; expiresAt: number }>()

// ==================== JWT FUNCTIONS ====================

export interface JWTPayload {
  userId: string
  username: string
  role: 'admin' | 'operations'
  displayName: string
  iat?: number
  exp?: number
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
  
  return token
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  
  refreshTokens.set(token, { userId, expiresAt })
  
  return token
}

/**
 * Verify JWT token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): string | null {
  const data = refreshTokens.get(token)
  
  if (!data) return null
  if (data.expiresAt < Date.now()) {
    refreshTokens.delete(token)
    return null
  }
  
  return data.userId
}

/**
 * Revoke refresh token
 */
export function revokeRefreshToken(token: string): void {
  refreshTokens.delete(token)
}

// ==================== RATE LIMITING ====================

/**
 * Check if IP is rate limited
 */
export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; lockedUntil?: number } {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)
  
  // Check if locked out
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil
    }
  }
  
  // Reset if window expired
  if (attempt && (now - attempt.firstAttempt) > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(ip)
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }
  
  // Check attempts
  if (attempt && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION
    loginAttempts.set(ip, { ...attempt, lockedUntil })
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil
    }
  }
  
  const remainingAttempts = MAX_LOGIN_ATTEMPTS - (attempt?.count || 0)
  return { allowed: true, remainingAttempts }
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)
  
  if (!attempt || (now - attempt.firstAttempt) > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    loginAttempts.set(ip, { ...attempt, count: attempt.count + 1 })
  }
}

/**
 * Clear login attempts on successful login
 */
export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Create session
 */
export function createSession(userId: string, deviceInfo: string): string {
  const sessionId = randomBytes(32).toString('hex')
  
  sessions.set(sessionId, {
    userId,
    lastActivity: Date.now(),
    deviceInfo
  })
  
  return sessionId
}

/**
 * Validate session
 */
export function validateSession(sessionId: string): { valid: boolean; userId?: string } {
  const session = sessions.get(sessionId)
  
  if (!session) {
    return { valid: false }
  }
  
  const now = Date.now()
  const timeSinceActivity = now - session.lastActivity
  
  // Check if session expired
  if (timeSinceActivity > SESSION_TIMEOUT) {
    sessions.delete(sessionId)
    return { valid: false }
  }
  
  // Update last activity
  session.lastActivity = now
  sessions.set(sessionId, session)
  
  return { valid: true, userId: session.userId }
}

/**
 * Destroy session
 */
export function destroySession(sessionId: string): void {
  sessions.delete(sessionId)
}

/**
 * Destroy all user sessions
 */
export function destroyAllUserSessions(userId: string): void {
  for (const [sessionId, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(sessionId)
    }
  }
}

// ==================== INPUT VALIDATION ====================

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate username
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  return { valid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength: number } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters', strength: 0 }
  }
  
  let strength = 0
  
  // Length
  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 20
  
  // Complexity
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15
  
  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin']
  const hasCommonPattern = commonPatterns.some(pattern => 
    password.toLowerCase().includes(pattern)
  )
  
  if (hasCommonPattern) {
    return { valid: false, error: 'Password contains common patterns', strength: 0 }
  }
  
  // Require at least one uppercase, one number
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter', strength }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number', strength }
  }
  
  return { valid: true, strength: Math.min(strength, 100) }
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true }
}

// ==================== AUDIT LOGGING ====================

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  ipAddress: string
  userAgent: string
  timestamp: string
  status: 'success' | 'failure'
  details?: any
}

const auditLogs: AuditLog[] = []

/**
 * Log security event
 */
export function logSecurityEvent(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const auditLog: AuditLog = {
    ...log,
    id: `AUDIT-${Date.now()}-${randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString()
  }
  
  auditLogs.push(auditLog)
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift()
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', auditLog)
  }
}

/**
 * Get audit logs
 */
export function getAuditLogs(userId?: string, limit: number = 100): AuditLog[] {
  let logs = [...auditLogs].reverse()
  
  if (userId) {
    logs = logs.filter(log => log.userId === userId)
  }
  
  return logs.slice(0, limit)
}

// ==================== 2FA UTILITIES ====================

/**
 * Generate 2FA secret
 */
export function generate2FASecret(): string {
  return randomBytes(20).toString('hex')
}

/**
 * Generate 2FA backup codes
 */
export function generate2FABackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
  }
  
  return codes
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  const hash = hashBackupCode(code)
  return hash === hashedCode
}

// ==================== CLEANUP ====================

/**
 * Cleanup expired data (run periodically)
 */
export function cleanupExpiredData(): void {
  const now = Date.now()
  
  // Cleanup expired refresh tokens
  for (const [token, data] of refreshTokens.entries()) {
    if (data.expiresAt < now) {
      refreshTokens.delete(token)
    }
  }
  
  // Cleanup expired sessions
  for (const [sessionId, session] of sessions.entries()) {
    if ((now - session.lastActivity) > SESSION_TIMEOUT) {
      sessions.delete(sessionId)
    }
  }
  
  // Cleanup old login attempts
  for (const [ip, attempt] of loginAttempts.entries()) {
    if ((now - attempt.firstAttempt) > RATE_LIMIT_WINDOW) {
      if (!attempt.lockedUntil || attempt.lockedUntil < now) {
        loginAttempts.delete(ip)
      }
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredData, 5 * 60 * 1000)
}
