import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { withAuth } from '@/lib/api-helpers'

/**
 * created_at comes from DB as "2026-06-02T15:37:35" (UTC, no timezone suffix)
 * Convert to Manila date string "YYYY-MM-DD"
 */
function getDateKey(createdAt: string): string {
  if (!createdAt) return ''
  // Append Z to treat as UTC, then convert to Manila date
  const utcStr = createdAt.includes('Z') ? createdAt : createdAt.replace(' ', 'T') + 'Z'
  return new Date(utcStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
}

function getHour(createdAt: string): number {
  if (!createdAt) return 0
  const utcStr = createdAt.includes('Z') ? createdAt : createdAt.replace(' ', 'T') + 'Z'
  return parseInt(new Date(utcStr).toLocaleString('en-US', { 
    timeZone: 'Asia/Manila', hour: 'numeric', hour12: false 
  }), 10)
}

// Get Manila now as a plain object {year, month, date, hour}
function getManilaNow() {
  const s = new Date().toLocaleString('en-CA', { 
    timeZone: 'Asia/Manila',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
  // Returns something like "2026-06-08, 20:30:00"
  const [datePart] = s.split(', ')
  return datePart // "2026-06-08"
}

// Get Manila today date string "YYYY-MM-DD"
function getManilaDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) // returns YYYY-MM-DD
}

// Get Manila today as "YYYY-MM-DD"
function getManilaToday(): string {
  return getManilaNow()
}

// Subtract days from a YYYY-MM-DD string
function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z') // noon UTC to avoid DST issues
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

// Get first day of month from a YYYY-MM-DD string
function firstOfMonth(dateStr: string): string {
  return dateStr.slice(0, 8) + '01'
}

// Convert Manila midnight boundary to UTC ISO (no Z) for DB comparison
// Manila = UTC+8, so Manila 00:00:00 = UTC 16:00:00 previous day
function manilaStartToUTC(manilaDateKey: string): string {
  const d = new Date(manilaDateKey + 'T00:00:00+08:00')
  return d.toISOString().replace('Z', '').slice(0, 19)
}
function manilaEndToUTC(manilaDateKey: string): string {
  const d = new Date(manilaDateKey + 'T23:59:59+08:00')
  return d.toISOString().replace('Z', '').slice(0, 19)
}

/**
 * GET /api/dept-manager/analytics
 * Comprehensive analytics for dept-manager:
 * - Sales trend (area chart, grouped by day/week/month)
 * - Product sales breakdown
 * - Store sales breakdown
 * - Agent ranking by store / category
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (user.role !== 'dept-manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') || user.assignedChannel
    const period = searchParams.get('period') || 'month' // today | week | month
    const agentFilter = searchParams.get('agent') || 'all'
    const customStart = searchParams.get('startDate')
    const customEnd = searchParams.get('endDate')

    if (!channel) {
      return NextResponse.json({
        salesTrend: [],
        productSales: [],
        storeSales: [],
        agentRanking: [],
        summary: { totalRevenue: 0, totalOrders: 0, cancelledOrders: 0, avgOrderValue: 0 }
      })
    }

    // Date range — compute Manila date boundaries, convert to UTC for DB
    const todayKey = getManilaToday() // "2026-06-08"

    let startManilaKey: string
    let endManilaKey: string

    if (customStart && customEnd) {
      // From date picker ISO strings — convert to Manila date
      startManilaKey = new Date(customStart).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
      endManilaKey   = new Date(customEnd).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    } else if (period === 'today') {
      startManilaKey = todayKey
      endManilaKey   = todayKey
    } else if (period === 'week') {
      startManilaKey = subtractDays(todayKey, 6)
      endManilaKey   = todayKey
    } else {
      startManilaKey = firstOfMonth(todayKey)
      endManilaKey   = todayKey
    }

    // UTC boundaries for DB filter (kept for reference, not used — we filter by 'date' column)
    // const dbStart = manilaStartToUTC(startManilaKey)
    // const dbEnd   = manilaEndToUTC(endManilaKey)

    console.log('[Analytics] Manila range:', startManilaKey, '→', endManilaKey)

    // Also select the 'date' field (local date set by client at dispatch time)
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id, date, sales_channel, store, courier, waybill,
        qty, cogs, total, product,
        status, is_cancelled,
        dispatched_by, agent_username,
        created_at
      `)
      .ilike('sales_channel', channel)
      .gte('date', startManilaKey)   // 'date' column is local date YYYY-MM-DD
      .lte('date', endManilaKey)
      .is('deleted_at', null)

    if (agentFilter !== 'all') {
      query = query.or(`agent_username.eq.${agentFilter},dispatched_by.eq.${agentFilter}`)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('[DeptManager Analytics] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    const allOrders = orders || []
    const activeOrders = allOrders.filter(o => !o.is_cancelled)

    // ── 1. SALES TREND ──────────────────────────────────────────────────────────
    const trendMap = new Map<string, { label: string; revenue: number; orders: number; cancelled: number }>()

    if (period === 'today' && !customStart) {
      // Group by hour using created_at (UTC→Manila)
      for (let h = 0; h < 24; h++) {
        const ampm = h < 12 ? 'AM' : 'PM'
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
        const label = `${h12}${ampm}`
        trendMap.set(String(h), { label, revenue: 0, orders: 0, cancelled: 0 })
      }
      for (const o of allOrders) {
        const h = getHour(o.created_at)
        const key = String(h)
        if (trendMap.has(key)) {
          const entry = trendMap.get(key)!
          entry.orders++
          if (o.is_cancelled) entry.cancelled++
          else entry.revenue += parseFloat(o.total) || 0
        }
      }
    } else if (period === 'week' && !customStart) {
      // Group by order.date (local YYYY-MM-DD set at dispatch time)
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      for (let i = 6; i >= 0; i--) {
        const key = subtractDays(todayKey, i)
        const d = new Date(key + 'T12:00:00Z')
        const label = `${dayNames[d.getUTCDay()]} ${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}`
        trendMap.set(key, { label, revenue: 0, orders: 0, cancelled: 0 })
      }
      for (const o of allOrders) {
        const key = (o.date || '').slice(0, 10) // use local date column directly
        if (trendMap.has(key)) {
          const entry = trendMap.get(key)!
          entry.orders++
          if (o.is_cancelled) entry.cancelled++
          else entry.revenue += parseFloat(o.total) || 0
        }
      }
    } else {
      // Month or custom range — group by order.date
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const cur = new Date(startManilaKey + 'T12:00:00Z')
      const last = new Date(endManilaKey + 'T12:00:00Z')
      while (cur <= last) {
        const key   = cur.toISOString().slice(0, 10)
        const label = `${monthNames[parseInt(key.slice(5,7))-1]} ${parseInt(key.slice(8,10))}`
        trendMap.set(key, { label, revenue: 0, orders: 0, cancelled: 0 })
        cur.setUTCDate(cur.getUTCDate() + 1)
      }
      for (const o of allOrders) {
        const key = (o.date || '').slice(0, 10) // use local date column directly
        if (trendMap.has(key)) {
          const entry = trendMap.get(key)!
          entry.orders++
          if (o.is_cancelled) entry.cancelled++
          else entry.revenue += parseFloat(o.total) || 0
        }
      }
    }
    const salesTrend = Array.from(trendMap.values())

    // ── 2. PRODUCT SALES ─────────────────────────────────────────────────────────
    const productMap = new Map<string, { product: string; revenue: number; orders: number; qty: number }>()
    for (const o of activeOrders) {
      // product field is comma-separated like "Product A (3), Product B (2)"
      const products = o.product ? o.product.split(',').map((p: string) => p.trim()) : ['Unknown']
      const perProduct = (parseFloat(o.total) || 0) / products.length
      const perQty = (o.qty || 1) / products.length

      for (const rawProduct of products) {
        // Strip quantity suffix like " (3)"
        const name = rawProduct.replace(/\s*\(\d+\)\s*$/, '').trim() || 'Unknown'
        if (!productMap.has(name)) {
          productMap.set(name, { product: name, revenue: 0, orders: 0, qty: 0 })
        }
        const entry = productMap.get(name)!
        entry.revenue += perProduct
        entry.orders++
        entry.qty += perQty
      }
    }
    const productSales = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // ── 3. STORE SALES ───────────────────────────────────────────────────────────
    const storeMap = new Map<string, { store: string; revenue: number; orders: number; qty: number }>()
    for (const o of activeOrders) {
      const store = o.store || 'Unknown'
      if (!storeMap.has(store)) {
        storeMap.set(store, { store, revenue: 0, orders: 0, qty: 0 })
      }
      const entry = storeMap.get(store)!
      entry.revenue += parseFloat(o.total) || 0
      entry.orders++
      entry.qty += o.qty || 0
    }
    const storeSales = Array.from(storeMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // ── 4. AGENT RANKING ─────────────────────────────────────────────────────────
    // Get team member display names (operations + dept-manager)
    const { data: agentUsers } = await supabaseAdmin
      .from('users')
      .select('username, display_name, role')
      .ilike('assigned_channel', channel)
      .in('role', ['operations', 'dept-manager'])

    const agentNameMap = new Map((agentUsers || []).map(a => [
      a.username,
      a.role === 'dept-manager'
        ? `${a.display_name || a.username} (Manager)`
        : (a.display_name || a.username)
    ]))

    const agentRankMap = new Map<string, {
      username: string; displayName: string
      revenue: number; orders: number; cancelled: number; qty: number
      topStore: string; topProduct: string
    }>()

    for (const o of allOrders) {
      const agentKey = o.agent_username || o.dispatched_by || 'Unknown'
      if (!agentRankMap.has(agentKey)) {
        agentRankMap.set(agentKey, {
          username: agentKey,
          displayName: agentNameMap.get(agentKey) || agentKey,
          revenue: 0, orders: 0, cancelled: 0, qty: 0,
          topStore: '', topProduct: ''
        })
      }
      const entry = agentRankMap.get(agentKey)!
      entry.orders++
      entry.qty += o.qty || 0
      if (o.is_cancelled) {
        entry.cancelled++
      } else {
        entry.revenue += parseFloat(o.total) || 0
      }
    }

    // Find top store and product per agent
    for (const [agentKey, agentData] of agentRankMap) {
      const agentActiveOrders = activeOrders.filter(o =>
        (o.agent_username || o.dispatched_by) === agentKey
      )
      // Top store
      const storeCount = new Map<string, number>()
      for (const o of agentActiveOrders) {
        storeCount.set(o.store || 'Unknown', (storeCount.get(o.store || 'Unknown') || 0) + 1)
      }
      agentData.topStore = [...storeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

      // Top product
      const prodCount = new Map<string, number>()
      for (const o of agentActiveOrders) {
        const prods = (o.product || '').split(',').map((p: string) => p.replace(/\s*\(\d+\)\s*$/, '').trim())
        for (const p of prods) {
          if (p) prodCount.set(p, (prodCount.get(p) || 0) + 1)
        }
      }
      agentData.topProduct = [...prodCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    }

    const agentRanking = Array.from(agentRankMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    // ── 5. SUMMARY ───────────────────────────────────────────────────────────────
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
    const totalOrders = allOrders.length
    const cancelledOrders = allOrders.filter(o => o.is_cancelled).length
    const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0

    return NextResponse.json({
      salesTrend,
      productSales,
      storeSales,
      agentRanking,
      summary: { totalRevenue, totalOrders, cancelledOrders, avgOrderValue }
    })
  } catch (error) {
    console.error('[DeptManager Analytics] Exception:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
})
