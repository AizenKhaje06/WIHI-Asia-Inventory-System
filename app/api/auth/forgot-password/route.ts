import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { hashPassword } from "@/lib/password-hash"
import { Resend } from "resend"

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 200 })
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
      return NextResponse.json({ error: "Failed to process request" }, { status: 200 })
    }

    if (!users || users.length === 0) {
      // Return specific error message for email not found
      return NextResponse.json({ 
        success: false,
        error: "This email is not associated with an admin account"
      }, { status: 200 })
    }

    const user = users[0]

    // Generate a temporary password (8 characters)
    const tempPassword = Math.random().toString(36).slice(-8)

    // Hash the temporary password
    const hashedPassword = await hashPassword(tempPassword)

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Forgot Password] Update error:', updateError)
      return NextResponse.json({ error: "Failed to reset password" }, { status: 200 })
    }

    // Send email with temporary password using Resend (if configured)
    try {
      // If Resend is not configured, just log the password and return success
      if (!resend) {
        console.log('[Forgot Password] ⚠️ Resend not configured - Temporary password:', tempPassword)
        console.log('[Forgot Password] User:', user.username, 'Email:', email)
        
        return NextResponse.json({ 
          success: true,
          message: "Password reset successfully. Check server logs for temporary password.",
          tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
        })
      }

      console.log('[Forgot Password] Sending email to:', email)
      
      // Use Resend's test email for development, or your verified domain for production
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
      
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Your Temporary Password - Vertex Inventory System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">Vertex Inventory System</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Hello <strong>${user.displayName || user.username}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                A password reset request was made for your admin account. Your temporary password is:
              </p>
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #667eea; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0;">
                  ${tempPassword}
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                <strong>Important:</strong> Please use this password to log in and change it immediately in your profile settings.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                If you did not request a password reset, please ignore this email or contact your administrator.
              </p>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2026 Vertex Inventory System. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `
      })

      console.log('[Forgot Password] Email result:', emailResult)

      if (emailResult.error) {
        console.error('[Forgot Password] Email send error:', emailResult.error)
        return NextResponse.json({ 
          success: false,
          error: "Failed to send reset email. Please try again."
        }, { status: 200 })
      }

      console.log(`[Forgot Password] Email sent successfully to ${email}`)

      return NextResponse.json({ 
        success: true,
        message: "Password reset email sent successfully"
      })

    } catch (emailError) {
      console.error('[Forgot Password] Email service error:', emailError)
      return NextResponse.json({ 
        success: false,
        error: "Failed to send reset email. Please try again."
      }, { status: 200 })
    }

  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 200 })
  }
}
