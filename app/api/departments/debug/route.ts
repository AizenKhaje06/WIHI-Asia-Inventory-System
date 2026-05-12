import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log('[Debug] Starting department debug check...')
    
    // Test 1: Check if we can connect to Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('[Debug] Connection test:', { success: !connectionError, error: connectionError?.message })
    
    // Test 2: Try to fetch all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
    
    console.log('[Debug] All users query:', { 
      count: allUsers?.length, 
      error: allUsersError?.message,
      users: allUsers?.map(u => ({ username: u.username, role: u.role }))
    })
    
    // Test 3: Try to fetch operations users
    const { data: opsUsers, error: opsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'operations')
    
    console.log('[Debug] Operations users query:', { 
      count: opsUsers?.length, 
      error: opsError?.message,
      users: opsUsers
    })
    
    // Test 4: Try to fetch specific TikTok user
    const { data: tiktokUser, error: tiktokError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'TikTok')
      .eq('role', 'operations')
      .single()
    
    console.log('[Debug] TikTok user query:', { 
      found: !!tiktokUser, 
      error: tiktokError?.message,
      user: tiktokUser
    })
    
    return NextResponse.json({
      connection: {
        success: !connectionError,
        error: connectionError?.message
      },
      allUsers: {
        count: allUsers?.length || 0,
        error: allUsersError?.message,
        users: allUsers?.map(u => ({ 
          id: u.id, 
          username: u.username, 
          role: u.role,
          display_name: u.display_name 
        }))
      },
      operationsUsers: {
        count: opsUsers?.length || 0,
        error: opsError?.message,
        users: opsUsers
      },
      tiktokUser: {
        found: !!tiktokUser,
        error: tiktokError?.message,
        user: tiktokUser
      },
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      }
    })
    
  } catch (error) {
    console.error('[Debug] Error:', error)
    return NextResponse.json(
      { 
        error: "Debug check failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
