import { NextRequest, NextResponse } from "next/server"
import { getAccounts, validateCredentials, updateAccount, updateUsername, addAccount } from "@/lib/supabase-db"
import { isSupabaseConfigured } from "@/lib/supabase"
import { withAdmin } from "@/lib/api-helpers"

// GET - Get all accounts (admin only)
export const GET = withAdmin(async (request, { user }) => {
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
})

// POST - Create new account or validate credentials (no auth required for login)
export async function POST(request: NextRequest) {
  try {
    console.log("[Accounts API] POST called")
    
    if (!isSupabaseConfigured) {
      console.log("[Accounts API] Supabase not configured")
      return NextResponse.json({ 
        error: "Database not configured. Please add Supabase environment variables." 
      }, { status: 503 })
    }

    console.log("[Accounts API] Parsing request body")
    const body = await request.json()
    const { action, username, password, role, displayName } = body
    console.log("[Accounts API] Action:", action, "Username:", username)

    if (action === "validate") {
      // Login - no auth required
      console.log("[Accounts API] Attempting to validate credentials")
      
      try {
        const account = await validateCredentials(username, password)
        console.log("[Accounts API] Validation result:", account ? "success" : "failed")
        
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
        console.error("[Accounts API] Database error during validation:", dbError)
        return NextResponse.json({ 
          success: false, 
          error: "Database connection error: " + (dbError.message || "Unknown error")
        }, { status: 500 })
      }
    } else if (action === "create") {
      // Create new account - requires admin (checked via middleware in frontend)
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
    console.error("[Accounts API] Error:", error)
    console.error("[Accounts API] Error stack:", error.stack)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Operation failed" 
    }, { status: 500 })
  }
}

// PUT - Update account (admin only)
export const PUT = withAdmin(async (request, { user }) => {
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
})
