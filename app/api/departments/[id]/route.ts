import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import { requireAuth } from "@/lib/api-auth"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  try {
    const departmentName = decodeURIComponent(context.params.id)
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('[Department Detail API] Department:', departmentName)
    console.log('[Department Detail API] Date range:', { startDate, endDate })

    // Get all transactions with caching
    const allTransactions = await getCachedData(
      'transactions',
      () => getTransactions(),
      2 * 60 * 1000 // 2 minutes
    )
    
    // Filter by department and date range
    let filteredTransactions = allTransactions.filter(t => {
      if (!t.department) return false
      
      // Match either the full department string or the sales channel part
      const salesChannel = t.department.includes(' / ') 
        ? t.department.split(' / ')[1] 
        : t.department
      
      return salesChannel === departmentName
    })
    
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      filteredTransactions = filteredTransactions.filter(t => new Date(t.timestamp) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filteredTransactions = filteredTransactions.filter(t => new Date(t.timestamp) <= end)
    }

    // Calculate metrics
    const metrics = {
      totalRevenue: filteredTransactions.reduce((sum, t) => sum + (t.totalRevenue || 0), 0),
      totalCost: filteredTransactions.reduce((sum, t) => sum + (t.totalCost || 0), 0),
      totalProfit: filteredTransactions.reduce((sum, t) => sum + (t.profit || 0), 0),
      transactionCount: filteredTransactions.length,
      totalQuantity: filteredTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0),
      profitMargin: 0
    }

    if (metrics.totalRevenue > 0) {
      metrics.profitMargin = (metrics.totalProfit / metrics.totalRevenue) * 100
    }

    // Group by date for cash flow chart
    const cashFlowMap = new Map<string, { date: string; revenue: number; cost: number; profit: number }>()
    
    // Fill in all dates in the range with zero values first
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        cashFlowMap.set(dateStr, { date: dateStr, revenue: 0, cost: 0, profit: 0 })
      }
    }
    
    // Now add actual transaction data
    filteredTransactions.forEach(t => {
      const date = new Date(t.timestamp).toISOString().split('T')[0]
      
      if (!cashFlowMap.has(date)) {
        cashFlowMap.set(date, { date, revenue: 0, cost: 0, profit: 0 })
      }
      
      const entry = cashFlowMap.get(date)!
      entry.revenue += t.totalRevenue || 0
      entry.cost += t.totalCost || 0
      entry.profit += t.profit || 0
    })

    const cashFlow = Array.from(cashFlowMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    
    filteredTransactions.forEach(t => {
      if (!productMap.has(t.itemName)) {
        productMap.set(t.itemName, { name: t.itemName, quantity: 0, revenue: 0 })
      }
      
      const product = productMap.get(t.itemName)!
      product.quantity += t.quantity || 0
      product.revenue += t.totalRevenue || 0
    })

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Recent transactions
    const recentTransactions = filteredTransactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
      .map(t => ({
        id: t.id,
        itemName: t.itemName,
        quantity: t.quantity,
        revenue: t.totalRevenue,
        cost: t.totalCost,
        profit: t.profit,
        timestamp: t.timestamp,
        staffName: t.staffName,
        notes: t.notes
      }))

    return NextResponse.json({
      department: {
        name: departmentName,
        metrics,
        cashFlow,
        topProducts,
        recentTransactions
      },
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    })
  } catch (error) {
    console.error("[Department Detail API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch department details" }, { status: 500 })
  }
}
