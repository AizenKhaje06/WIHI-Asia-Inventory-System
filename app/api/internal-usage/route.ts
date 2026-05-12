import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    // Get user from headers for department filtering
    const userRole = request.headers.get('x-user-role')
    const assignedChannel = request.headers.get('x-assigned-channel')

    // Fetch all transactions
    const allTransactions = await getTransactions()
    
    // Filter for internal usage types only (demo, internal, transfer)
    let internalTransactions = allTransactions.filter(
      (transaction) => 
        transaction.transactionType === 'demo' ||
        transaction.transactionType === 'internal' ||
        transaction.transactionType === 'transfer'
    )

    // DEPARTMENT FILTERING: Operations users only see their department's transactions
    if (userRole === 'operations' && assignedChannel) {
      internalTransactions = internalTransactions.filter(transaction => {
        // Extract sales channel from department string (e.g., "Facebook / Store 1" -> "Facebook")
        const transactionChannel = transaction.department?.split(' / ')[0].trim()
        return transactionChannel === assignedChannel
      })
    }
    // Admin sees all transactions
    
    // Sort by timestamp descending (newest first)
    internalTransactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    return NextResponse.json(internalTransactions)
  } catch (error) {
    console.error("[API] Error fetching internal usage transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch internal usage transactions" },
      { status: 500 }
    )
  }
}
