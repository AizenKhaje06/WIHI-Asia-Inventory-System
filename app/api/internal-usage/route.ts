import { NextResponse } from "next/server"
import { getTransactions } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"

export async function GET() {
  try {
    // Get all transactions WITHOUT caching for debugging
    const transactions = await getTransactions()

    console.log('[Internal Usage API] Total transactions:', transactions.length)
    
    // Log first 5 transactions with their types
    const sample = transactions.slice(0, 5).map((t: any) => ({
      id: t.id,
      itemName: t.itemName,
      department: t.department,
      transactionType: t.transactionType,
      type: t.type
    }))
    console.log('[Internal Usage API] Sample transactions:', JSON.stringify(sample, null, 2))

    // Filter only demo and internal use transactions
    const internalUsageTransactions = transactions.filter(
      (t: any) => {
        const isDemo = t.transactionType === 'demo'
        const isInternal = t.transactionType === 'internal'
        if (isDemo || isInternal) {
          console.log(`[Internal Usage API] Found ${t.transactionType}:`, t.itemName, t.department)
        }
        return isDemo || isInternal
      }
    )

    console.log('[Internal Usage API] Filtered demo/internal count:', internalUsageTransactions.length)

    return NextResponse.json({ transactions: internalUsageTransactions })
  } catch (error) {
    console.error("[Internal Usage API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch internal usage data" }, { status: 500 })
  }
}
