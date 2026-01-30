import { NextRequest, NextResponse } from "next/server"
import { getAccounts, validateCredentials, updateAccount, updateUsername, addAccount } from "@/lib/google-sheets"

// GET - Get all accounts (admin only)
export async function GET() {
  try {
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
    const body = await request.json()
    const { action, username, password, role, displayName } = body

    if (action === "validate") {
      // Validate credentials
      const account = await validateCredentials(username, password)
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
    console.error("[Accounts API] Error:", error)
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 })
  }
}

// PUT - Update account
export async function PUT(request: NextRequest) {
  try {
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
