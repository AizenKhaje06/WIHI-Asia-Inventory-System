import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Query packer1 account
    const { data: packer, error: packerError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'packer1')
      .single()
    
    if (packerError) {
      console.error('[Debug Packer] Error:', packerError)
      return NextResponse.json({
        success: false,
        error: packerError.message,
        code: packerError.code
      })
    }
    
    // Check password format
    const passwordStatus = packer.password.startsWith('$2') ? 'Bcrypt hashed ✓' : 'Plain text ✗'
    
    return NextResponse.json({
      success: true,
      account: {
        username: packer.username,
        role: packer.role,
        displayName: packer.display_name,
        email: packer.email,
        passwordStatus: passwordStatus,
        passwordLength: packer.password.length,
        passwordPrefix: packer.password.substring(0, 10) + '...',
        createdAt: packer.created_at
      }
    })
  } catch (error: any) {
    console.error('[Debug Packer] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to debug packer account'
    }, { status: 500 })
  }
}
