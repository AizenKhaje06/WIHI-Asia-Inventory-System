import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    // Fetch all transactions
    const allTransactions = await getTransactions()
    
    // Filter for internal usage types only (demo, internal, transfer)
    const internalTransactions = allTransactions.filter(
      (transaction) => 
        transaction.transactionType === 'demo' ||
        transaction.transactionType === 'internal' ||
        transaction.transactionType === 'transfer'
    )
    
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
