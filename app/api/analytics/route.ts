import { type NextRequest, NextResponse } from "next/server"
import { getInventoryItems, getTransactions } from "@/lib/google-sheets"
import {
  calculateSalesForecast,
  performABCAnalysis,
  calculateInventoryTurnover,
  identifyDeadStock,
  calculateProfitMarginByCategory,
  calculateReorderPoint
} from "@/lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const itemId = searchParams.get('itemId')

    const items = await getInventoryItems()
    const transactions = await getTransactions()

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
        result = performABCAnalysis(items, transactions)
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

      case 'all':
      default:
        result = {
          abc: performABCAnalysis(items, transactions),
          turnover: calculateInventoryTurnover(items, transactions),
          deadStock: identifyDeadStock(items, transactions),
          profitMargin: calculateProfitMarginByCategory(transactions, items)
        }
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating analytics:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}
