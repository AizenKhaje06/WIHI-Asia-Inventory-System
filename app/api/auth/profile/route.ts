import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get current user from headers
    const username = request.headers.get('x-user-username')
    
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user profile from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('username, role, display_name, email, phone')
      .eq('username', username)
      .single()

    if (error || !user) {
      console.error('[Profile API] Error fetching user:', error)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      username: user.username,
      role: user.role,
      displayName: user.display_name,
      email: user.email || '',
      phone: user.phone || ''
    })

  } catch (error) {
    console.error('[Profile API] Error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
