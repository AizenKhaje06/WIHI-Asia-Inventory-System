import { type NextRequest, NextResponse } from "next/server"
import { getTransactions } from "@/lib/supabase-db"
import { getCachedData } from "@/lib/cache"
import { withAuth } from "@/lib/api-helpers"

export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const departmentFilter = searchParams.get('department')

    console.log('[Departments API] Params:', { startDate, endDate, departmentFilter })

    // Get all transactions with caching
    const allTransactions = await getCachedData(
      'transactions',
      () => getTransactions(),
      2 * 60 * 1000 // 2 minutes
    )
    
    // Filter by date range if provided
    let filteredTransactions = allTransactions
    
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

    // Extract unique departments/sales channels
    const departmentMap = new Map<string, {
      name: string
      type: 'sale' | 'demo' | 'internal' | 'transfer'
      revenue: number
      cost: number
      profit: number
      transactions: number
      quantity: number
    }>()

    console.log('[Departments API] Processing transactions:', filteredTransactions.length)

    filteredTransactions.forEach(transaction => {
      if (!transaction.department) return

      console.log('[Departments API] Transaction department:', transaction.department)

      // Extract base department (before the " / " if it exists)
      const baseDepartment = transaction.department.split(' / ')[0]
      
      // Determine type based on base department
      let type: 'sale' | 'demo' | 'internal' | 'transfer' = 'sale'
      if (baseDepartment === 'Demo/Display') type = 'demo'
      else if (baseDepartment === 'Internal Use') type = 'internal'
      else if (baseDepartment === 'Warehouse') type = 'transfer'

      console.log('[Departments API] Base:', baseDepartment, 'Type:', type)

      // For sales channels page, ONLY process actual sales (type === 'sale')
      // Skip demo, internal, and warehouse transfers entirely
      if (type !== 'sale') {
        console.log('[Departments API] Skipping non-sale transaction')
        return
      }

      // For sales, use the department name directly (no splitting needed)
      const salesChannel = transaction.department
      const key = salesChannel

      if (!departmentMap.has(key)) {
        console.log('[Departments API] Creating new sales channel:', key)

        departmentMap.set(key, {
          name: key,
          type: 'sale',
          revenue: 0,
          cost: 0,
          profit: 0,
          transactions: 0,
          quantity: 0
        })
      }

      const dept = departmentMap.get(key)!
      dept.revenue += transaction.totalRevenue || 0
      dept.cost += transaction.totalCost || 0
      dept.profit += transaction.profit || 0
      dept.transactions += 1
      dept.quantity += transaction.quantity || 0
    })

    console.log('[Departments API] Department map:', Array.from(departmentMap.entries()))

    // Convert to array - already filtered to sales only
    const departments = Array.from(departmentMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    // Filter by specific department if requested
    const finalDepartments = departmentFilter 
      ? departments.filter(d => d.name === departmentFilter)
      : departments

    // Calculate totals
    const totals = {
      revenue: departments.reduce((sum, d) => sum + d.revenue, 0),
      cost: departments.reduce((sum, d) => sum + d.cost, 0),
      profit: departments.reduce((sum, d) => sum + d.profit, 0),
      transactions: departments.reduce((sum, d) => sum + d.transactions, 0),
      quantity: departments.reduce((sum, d) => sum + d.quantity, 0)
    }

    console.log('[Departments API] Found departments:', departments.length)

    return NextResponse.json({
      departments: finalDepartments,
      totals,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    })
  } catch (error) {
    console.error("[Departments API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch departments data" }, { status: 500 })
  }
})
