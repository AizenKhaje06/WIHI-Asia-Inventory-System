import { type NextRequest, NextResponse } from "next/server"
import { getInventoryItems, getTransactions, getRestocks } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import {
  calculateSalesForecast,
  performABCAnalysis,
  calculateInventoryTurnover,
  identifyDeadStock,
  calculateProfitMarginByCategory,
  calculateReorderPoint,
  calculateReturnAnalytics,
  calculateNetSales,
  performABCAnalysisWithReturns
} from "@/lib/analytics"
import { withAuth } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const itemId = searchParams.get('itemId')

    const items = await getCachedData(
      'inventory-items',
      () => getInventoryItems(),
      2 * 60 * 1000
    )
    
    const transactions = await getCachedData(
      'transactions',
      () => getTransactions(),
      2 * 60 * 1000
    )
    
    const restocks = await getCachedData(
      'restocks',
      () => getRestocks(),
      2 * 60 * 1000
    )

    let result: any = {}

    switch (type) {
      case 'forecast':
        if (itemId) {
          result = calculateSalesForecast(transactions, itemId)
        } else {
          // Get forecasts for all items
          result = items
            .map(item => calculateSalesForecast(transactions, item.id))
            .filter(f => f !== null)
        }
        break

      case 'abc':
        // Use ABC analysis with returns for more accurate results
        result = performABCAnalysisWithReturns(items, transactions, restocks)
        break

      case 'turnover':
        result = calculateInventoryTurnover(items, transactions)
        break

      case 'deadstock':
        result = identifyDeadStock(items, transactions)
        break

      case 'profitmargin':
        result = calculateProfitMarginByCategory(transactions, items)
        break

      case 'reorderpoint':
        if (itemId) {
          result = { reorderPoint: calculateReorderPoint(transactions, itemId) }
        }
        break

      case 'returns':
        result = calculateReturnAnalytics(restocks, transactions, items)
        break

      case 'netsales':
        result = calculateNetSales(transactions, restocks)
        break

      case 'all':
      default:
        result = {
          abc: performABCAnalysisWithReturns(items, transactions, restocks),
          turnover: calculateInventoryTurnover(items, transactions),
          deadStock: identifyDeadStock(items, transactions),
          profitMargin: calculateProfitMarginByCategory(transactions, items),
          returns: calculateReturnAnalytics(restocks, transactions, items),
          netSales: calculateNetSales(transactions, restocks)
        }
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Error generating analytics:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
})
