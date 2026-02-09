import { NextRequest, NextResponse } from "next/server"
// Using Supabase as primary database
import { getAccounts, validateCredentials, updateAccount, updateUsername, addAccount } from "@/lib/supabase-db"
import { isSupabaseConfigured } from "@/lib/supabase"

// GET - Get all accounts (admin only)
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ 
        error: "Database not configured. Please add Supabase environment variables." 
      }, { status: 503 })
    }

    const accounts = await getAccounts()
    
    // Remove passwords from response for security
    const safeAccounts = accounts.map(acc => ({
      id: acc.id,
      username: acc.username,
      role: acc.role,
      displayName: acc.displayName,
      createdAt: acc.createdAt
    }))
    
    return NextResponse.json(safeAccounts)
  } catch (error) {
    console.error("[Accounts API] Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

// POST - Create new account or validate credentials
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Accounts POST API called")
    
    if (!isSupabaseConfigured) {
      console.log("[v0] Supabase not configured")
      return NextResponse.json({ 
        error: "Database not configured. Please add Supabase environment variables." 
      }, { status: 503 })
    }

    console.log("[v0] Parsing request body")
    const body = await request.json()
    const { action, username, password, role, displayName } = body
    console.log("[v0] Action:", action, "Username:", username)

    if (action === "validate") {
      console.log("[v0] Attempting to validate credentials")
      
      try {
        const account = await validateCredentials(username, password)
        console.log("[v0] Validation result:", account ? "success" : "failed")
        
        if (account) {
          return NextResponse.json({
            success: true,
            account: {
              username: account.username,
              role: account.role,
              displayName: account.displayName
            }
          })
        } else {
          return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
        }
      } catch (dbError: any) {
        console.error("[v0] Database error during validation:", dbError)
        return NextResponse.json({ 
          success: false, 
          error: "Database connection error: " + (dbError.message || "Unknown error")
        }, { status: 500 })
      }
    } else if (action === "create") {
      // Create new account
      const newAccount = await addAccount({
        username,
        password,
        role: role || "operations",
        displayName: displayName || username
      })
      
      return NextResponse.json({
        success: true,
        account: {
          id: newAccount.id,
          username: newAccount.username,
          role: newAccount.role,
          displayName: newAccount.displayName,
          createdAt: newAccount.createdAt
        }
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Accounts API Error:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Operation failed" 
    }, { status: 500 })
  }
}

// PUT - Update account
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ 
        error: "Database not configured. Please add Supabase environment variables." 
      }, { status: 503 })
    }

    const body = await request.json()
    const { action, username, newUsername, password, displayName } = body

    if (action === "updatePassword") {
      await updateAccount(username, { password })
      return NextResponse.json({ success: true, message: "Password updated successfully" })
    } else if (action === "updateDisplayName") {
      await updateAccount(username, { displayName })
      return NextResponse.json({ success: true, message: "Display name updated successfully" })
    } else if (action === "updateUsername") {
      await updateUsername(username, newUsername)
      return NextResponse.json({ success: true, message: "Username updated successfully" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[Accounts API] Error:", error)
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 })
  }
}
