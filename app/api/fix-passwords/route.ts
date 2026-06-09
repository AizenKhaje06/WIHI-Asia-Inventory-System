import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Fix all plain-text passwords by hashing them with bcrypt
 * This endpoint will:
 * 1. Query all users from the database
 * 2. Check if passwords are already hashed (start with $2a$ or $2b$)
 * 3. Hash any plain-text passwords found
 * 4. Update the database with hashed passwords
 */
export async function POST() {
  try {
    console.log('[Fix Passwords] Starting password fix process...')
    
    // Import bcrypt
    const bcrypt = require('bcryptjs')
    
    // Get all users
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('username, password, role')
    
    if (fetchError) {
      console.error('[Fix Passwords] Fetch error:', fetchError)
      throw new Error(`Failed to fetch users: ${fetchError.message}`)
    }
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in database'
      })
    }
    
    console.log('[Fix Passwords] Found', users.length, 'users')
    
    const updatedUsers: string[] = []
    const alreadyHashed: string[] = []
    const errors: Array<{username: string, error: string}> = []
    
    // Process each user
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log('[Fix Passwords] User', user.username, 'already has hashed password')
        alreadyHashed.push(user.username)
        continue
      }
      
      console.log('[Fix Passwords] Hashing plain-text password for user:', user.username)
      
      // Hash the plain-text password
      const hashedPassword = await bcrypt.hash(user.password, 10)
      
      // Update the user's password
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('username', user.username)
      
      if (updateError) {
        console.error('[Fix Passwords] Update error for', user.username, ':', updateError)
        errors.push({
          username: user.username,
          error: updateError.message
        })
      } else {
        console.log('[Fix Passwords] Successfully hashed password for:', user.username)
        updatedUsers.push(user.username)
      }
    }
    
    // Verify all passwords are now hashed
    const { data: verifiedUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('username, password, role, display_name')
    
    if (verifyError) {
      console.error('[Fix Passwords] Verify error:', verifyError)
    }
    
    const passwordStatus = verifiedUsers?.map(u => ({
      username: u.username,
      role: u.role,
      displayName: u.display_name,
      passwordStatus: (u.password.startsWith('$2a$') || u.password.startsWith('$2b$')) ? 'Hashed ✓' : 'Plain text ✗'
    }))
    
    console.log('[Fix Passwords] Process complete!')
    console.log('[Fix Passwords] Updated:', updatedUsers.length)
    console.log('[Fix Passwords] Already hashed:', alreadyHashed.length)
    console.log('[Fix Passwords] Errors:', errors.length)
    
    return NextResponse.json({
      success: true,
      message: `Password fix complete: ${updatedUsers.length} updated, ${alreadyHashed.length} already hashed, ${errors.length} errors`,
      summary: {
        total: users.length,
        updated: updatedUsers.length,
        alreadyHashed: alreadyHashed.length,
        errors: errors.length
      },
      updatedUsers,
      alreadyHashed,
      errors,
      passwordStatus
    })
  } catch (error: any) {
    console.error('[Fix Passwords] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fix passwords'
    }, { status: 500 })
  }
}
