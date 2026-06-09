/**
 * Session Manager - Single Device Login Security
 * 
 * Prevents users from logging in on multiple devices simultaneously.
 * When a user logs in on a new device, previous sessions are invalidated.
 */

import { supabaseAdmin } from './supabase'
import crypto from 'crypto'

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session for a user (invalidates all previous sessions)
 */
export async function createSession(username: string): Promise<string> {
  const sessionId = generateSessionId()
  const now = new Date().toISOString()
  
  console.log('[Session Manager] Creating new session for:', username)
  
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      active_session_id: sessionId,
      session_created_at: now,
      last_activity: now
    })
    .eq('username', username)
  
  if (error) {
    console.error('[Session Manager] Error creating session:', error)
    throw new Error('Failed to create session')
  }
  
  console.log('[Session Manager] Session created successfully:', sessionId.substring(0, 8) + '...')
  return sessionId
}

/**
 * Validate if a session is still active
 */
export async function validateSession(username: string, sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('active_session_id, session_created_at')
      .eq('username', username)
      .single()
    
    if (error || !data) {
      console.log('[Session Manager] User not found or error:', username)
      return false
    }
    
    // Check if session ID matches
    const isValid = data.active_session_id === sessionId
    
    if (!isValid) {
      console.log('[Session Manager] Session mismatch for:', username)
      console.log('[Session Manager] Expected:', data.active_session_id?.substring(0, 8) + '...')
      console.log('[Session Manager] Received:', sessionId?.substring(0, 8) + '...')
    }
    
    return isValid
  } catch (error) {
    console.error('[Session Manager] Error validating session:', error)
    return false
  }
}

/**
 * Update last activity timestamp
 */
export async function updateActivity(username: string): Promise<void> {
  const now = new Date().toISOString()
  
  await supabaseAdmin
    .from('users')
    .update({ last_activity: now })
    .eq('username', username)
}

/**
 * Invalidate a user's session (logout)
 */
export async function invalidateSession(username: string): Promise<void> {
  console.log('[Session Manager] Invalidating session for:', username)
  
  await supabaseAdmin
    .from('users')
    .update({
      active_session_id: null,
      session_created_at: null,
      last_activity: null
    })
    .eq('username', username)
}

/**
 * Get session info for debugging
 */
export async function getSessionInfo(username: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('active_session_id, session_created_at, last_activity')
    .eq('username', username)
    .single()
  
  return data
}
