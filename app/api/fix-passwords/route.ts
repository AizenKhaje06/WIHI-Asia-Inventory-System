import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Import bcrypt
    const bcrypt = require('bcryptjs')
    
    // Hash the passwords
    const packerHash = await bcrypt.hash('pack789', 10)
    const trackerHash = await bcrypt.hash('tracker123', 10)
    
    console.log('[Fix Passwords] Packer hash:', packerHash)
    console.log('[Fix Passwords] Tracker hash:', trackerHash)
    
    // Update packer1 password
    const { error: packerError } = await supabaseAdmin
      .from('users')
      .update({ password: packerHash })
      .eq('username', 'packer1')
    
    if (packerError) {
      console.error('[Fix Passwords] Packer update error:', packerError)
      throw new Error(`Failed to update packer password: ${packerError.message}`)
    }
    
    // Update tracker password
    const { error: trackerError } = await supabaseAdmin
      .from('users')
      .update({ password: trackerHash })
      .eq('username', 'tracker')
    
    if (trackerError) {
      console.error('[Fix Passwords] Tracker update error:', trackerError)
      throw new Error(`Failed to update tracker password: ${trackerError.message}`)
    }
    
    // Verify the updates
    const { data: users, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('username, role, display_name, password')
      .in('username', ['packer1', 'tracker'])
    
    if (verifyError) {
      console.error('[Fix Passwords] Verify error:', verifyError)
    }
    
    console.log('[Fix Passwords] Updated users:', users)
    
    return NextResponse.json({
      success: true,
      message: 'Passwords updated successfully',
      users: users?.map(u => ({
        username: u.username,
        role: u.role,
        displayName: u.display_name,
        passwordStatus: u.password.startsWith('$2') ? 'Bcrypt hashed ✓' : 'Plain text ✗'
      }))
    })
  } catch (error: any) {
    console.error('[Fix Passwords] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fix passwords'
    }, { status: 500 })
  }
}
