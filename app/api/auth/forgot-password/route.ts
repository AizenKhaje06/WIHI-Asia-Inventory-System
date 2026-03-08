import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin') // Only allow admin password reset
      .limit(1)

    if (error) {
      console.error('[Forgot Password] Database error:', error)
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({ 
        success: true, 
        message: "If an admin account with that email exists, a password reset link has been sent" 
      })
    }

    const user = users[0]

    // Generate a temporary password (6 characters)
    const tempPassword = Math.random().toString(36).slice(-8)

    // TODO: In production, you would:
    // 1. Generate a secure reset token
    // 2. Store it in database with expiration
    // 3. Send email with reset link
    // 4. User clicks link and sets new password
    
    // For now, we'll just update the password directly
    // and return it (NOT SECURE - only for development/demo)
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Forgot Password] Update error:', updateError)
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    // In development, return the temp password
    // In production, this would send an email instead
    console.log(`[Forgot Password] Temporary password for ${email}: ${tempPassword}`)

    return NextResponse.json({ 
      success: true,
      message: "Password reset successful",
      // REMOVE THIS IN PRODUCTION - only for demo
      tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
    })

  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
