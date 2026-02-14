/**
 * Two-Factor Authentication (2FA) Implementation
 * Using TOTP (Time-based One-Time Password)
 */

import { createHmac } from 'crypto'

/**
 * Generate TOTP code
 * Based on RFC 6238
 */
export function generateTOTP(secret: string, timeStep: number = 30): string {
  const time = Math.floor(Date.now() / 1000 / timeStep)
  const timeBuffer = Buffer.alloc(8)
  
  // Write time as big-endian 64-bit integer
  timeBuffer.writeBigUInt64BE(BigInt(time))
  
  // Create HMAC-SHA1
  const hmac = createHmac('sha1', Buffer.from(secret, 'hex'))
  hmac.update(timeBuffer)
  const hash = hmac.digest()
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f
  const code = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  ) % 1000000
  
  // Return 6-digit code with leading zeros
  return code.toString().padStart(6, '0')
}

/**
 * Verify TOTP code
 * Allows for time drift (±1 time step)
 */
export function verifyTOTP(secret: string, code: string, timeStep: number = 30): boolean {
  if (!code || code.length !== 6) {
    return false
  }
  
  // Check current time and ±1 time step for clock drift
  const currentTime = Math.floor(Date.now() / 1000 / timeStep)
  
  for (let i = -1; i <= 1; i++) {
    const time = currentTime + i
    const timeBuffer = Buffer.alloc(8)
    timeBuffer.writeBigUInt64BE(BigInt(time))
    
    const hmac = createHmac('sha1', Buffer.from(secret, 'hex'))
    hmac.update(timeBuffer)
    const hash = hmac.digest()
    
    const offset = hash[hash.length - 1] & 0x0f
    const generatedCode = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % 1000000
    
    if (generatedCode.toString().padStart(6, '0') === code) {
      return true
    }
  }
  
  return false
}

/**
 * Generate QR code data URL for authenticator apps
 */
export function generate2FAQRCode(username: string, secret: string, issuer: string = 'WIHI Asia Inventory'): string {
  // Format: otpauth://totp/Issuer:Username?secret=SECRET&issuer=Issuer
  const label = encodeURIComponent(`${issuer}:${username}`)
  const params = new URLSearchParams({
    secret: secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30'
  })
  
  return `otpauth://totp/${label}?${params.toString()}`
}

/**
 * Generate base32 secret for better compatibility
 * (Most authenticator apps prefer base32)
 */
export function generateBase32Secret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)]
  }
  
  return secret
}

/**
 * Convert hex secret to base32
 */
export function hexToBase32(hex: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bytes = Buffer.from(hex, 'hex')
  let bits = ''
  let base32 = ''
  
  // Convert bytes to bits
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0')
  }
  
  // Convert bits to base32
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0')
    base32 += chars[parseInt(chunk, 2)]
  }
  
  return base32
}

/**
 * Convert base32 secret to hex
 */
export function base32ToHex(base32: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  
  // Convert base32 to bits
  for (const char of base32.toUpperCase()) {
    const index = chars.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, '0')
  }
  
  // Convert bits to bytes
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8)
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2))
    }
  }
  
  return Buffer.from(bytes).toString('hex')
}

/**
 * Validate 2FA setup
 */
export function validate2FASetup(secret: string, code: string): { valid: boolean; error?: string } {
  if (!secret || secret.length < 16) {
    return { valid: false, error: 'Invalid secret' }
  }
  
  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { valid: false, error: 'Code must be 6 digits' }
  }
  
  const isValid = verifyTOTP(secret, code)
  
  if (!isValid) {
    return { valid: false, error: 'Invalid code. Please try again.' }
  }
  
  return { valid: true }
}
