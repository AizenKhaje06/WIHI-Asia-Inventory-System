/**
 * Password Hashing Utilities
 * 
 * Uses bcrypt to securely hash and verify passwords
 * NEVER store plain text passwords in the database!
 */

import bcrypt from 'bcryptjs'

/**
 * Hash a plain text password
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10 // Higher = more secure but slower
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Check if a string is already hashed (bcrypt format)
 * @param str - String to check
 * @returns true if string appears to be a bcrypt hash
 */
export function isHashed(str: string): boolean {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str)
}
