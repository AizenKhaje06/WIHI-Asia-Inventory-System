/**
 * Verify Dashboard Day/Week/Month Tabs Data Accuracy
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyDashboardTabs() {
  console.log('='.repeat(80))
  console.log('DASHBOARD TABS DATA VERIFICATION')
  console.log('='.repeat(80))
  console.log()

  try {
    const now = new Date('2026-05-22T16:33:10') // Current time from your screenshot
    
    // Calculate date ranges
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)
    
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6)
    lastWeekEnd.setHours(23, 59, 59, 999)
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    lastMonthEnd.setHours(23, 59, 59, 999)

    console.log('📅 Date Ranges:')
    console.log('─'.repeat(80))
    console.log(`Today: ${today.toISOString().split('T')[0]} to ${todayEnd.toISOString().split('T')[0]}`)
    console.log(`Yesterday: ${yesterday.toISOString().split('T')[0]}`)
    console.log(`This Week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`)
    console.log(`Last Week: ${lastWeekStart.toISOString().split('T')[0]} to ${lastWeekEnd.toISOString().split('T')[0]}`)
    console.log(`This Month: ${monthStart.toISOString().split('T')[0]} to ${monthEnd.toISOString().split('T')[0]}`)
    console.log(`Last Month: ${lastMonthStart.toISOString().split('T')[0]} to ${lastMonthEnd.toISOString().split('T')[0]}`)
    console.log()

    // Fetch all packed orders
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .order('packed_at', { ascending: false })

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log(`Total Packed Orders: ${allOrders.length}`)
    console.log()

    // Helper function to filter orders by date range
    const filterByDateRange = (orders, start, end) => {
      return orders.filter(order => {
        const packedDate = new Date(order.packed_at || order.created_at)
        return packedDate >= start && packedDate <= end
      })
    }

    // Helper function to calculate metrics
    const calculateMetrics = (orders) => {
      const activeOrders = orders.filter(o => 
        !['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(o.parcel_status)
      )
      const revenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      const cost = activeOrders.reduce((sum, o) => sum + (o.cogs || 0), 0)
      const profit = revenue - cost
      return { count: activeOrders.length, revenue, cost, profit }
    }

    // DAY TAB
    console.log('1️⃣  DAY TAB')
    console.log('─'.repeat(80))
    
    const todayOrders = filterByDateRange(allOrders, today, todayEnd)
    const yesterdayOrders = filterByDateRange(allOrders, yesterday, yesterdayEnd)
    
    const todayMetrics = calculateMetrics(todayOrders)
    const yesterdayMetrics = calculateMetrics(yesterdayOrders)
    
    console.log('Today:')
    console.log(`  Orders: ${todayMetrics.count}`)
    console.log(`  Revenue: ₱${todayMetrics.revenue.toLocaleString()}`)
    console.log(`  Cost: ₱${todayMetrics.cost.toLocaleString()}`)
    console.log(`  Profit: ₱${todayMetrics.profit.toLocaleString()}`)
    console.log()
    
    console.log('Yesterday:')
    console.log(`  Orders: ${yesterdayMetrics.count}`)
    console.log(`  Revenue: ₱${yesterdayMetrics.revenue.toLocaleString()}`)
    console.log()
    
    console.log('Change:')
    console.log(`  Revenue: +₱${(todayMetrics.revenue - yesterdayMetrics.revenue).toLocaleString()}`)
    console.log()
    
    console.log('Expected on Dashboard (Day tab):')
    console.log(`  Today: ₱${todayMetrics.revenue.toLocaleString()} (${todayMetrics.count} units sold)`)
    console.log(`  Yesterday: ₱${yesterdayMetrics.revenue.toLocaleString()}`)
    console.log(`  Change: +₱${(todayMetrics.revenue - yesterdayMetrics.revenue).toLocaleString()}`)
    console.log()

    // WEEK TAB
    console.log('2️⃣  WEEK TAB')
    console.log('─'.repeat(80))
    
    const thisWeekOrders = filterByDateRange(allOrders, weekStart, weekEnd)
    const lastWeekOrders = filterByDateRange(allOrders, lastWeekStart, lastWeekEnd)
    
    const thisWeekMetrics = calculateMetrics(thisWeekOrders)
    const lastWeekMetrics = calculateMetrics(lastWeekOrders)
    
    console.log('This Week:')
    console.log(`  Orders: ${thisWeekMetrics.count}`)
    console.log(`  Revenue: ₱${thisWeekMetrics.revenue.toLocaleString()}`)
    console.log(`  Cost: ₱${thisWeekMetrics.cost.toLocaleString()}`)
    console.log(`  Profit: ₱${thisWeekMetrics.profit.toLocaleString()}`)
    console.log()
    
    console.log('Last Week:')
    console.log(`  Orders: ${lastWeekMetrics.count}`)
    console.log(`  Revenue: ₱${lastWeekMetrics.revenue.toLocaleString()}`)
    console.log()
    
    console.log('Change:')
    console.log(`  Revenue: +₱${(thisWeekMetrics.revenue - lastWeekMetrics.revenue).toLocaleString()}`)
    console.log()
    
    console.log('Expected on Dashboard (Week tab):')
    console.log(`  This Week: ₱${thisWeekMetrics.revenue.toLocaleString()} (${thisWeekMetrics.count} units sold)`)
    console.log(`  Last Week: ₱${lastWeekMetrics.revenue.toLocaleString()}`)
    console.log(`  Change: +₱${(thisWeekMetrics.revenue - lastWeekMetrics.revenue).toLocaleString()}`)
    console.log()

    // MONTH TAB
    console.log('3️⃣  MONTH TAB')
    console.log('─'.repeat(80))
    
    const thisMonthOrders = filterByDateRange(allOrders, monthStart, monthEnd)
    const lastMonthOrders = filterByDateRange(allOrders, lastMonthStart, lastMonthEnd)
    
    const thisMonthMetrics = calculateMetrics(thisMonthOrders)
    const lastMonthMetrics = calculateMetrics(lastMonthOrders)
    
    console.log('This Month (May 2026):')
    console.log(`  Orders: ${thisMonthMetrics.count}`)
    console.log(`  Revenue: ₱${thisMonthMetrics.revenue.toLocaleString()}`)
    console.log(`  Cost: ₱${thisMonthMetrics.cost.toLocaleString()}`)
    console.log(`  Profit: ₱${thisMonthMetrics.profit.toLocaleString()}`)
    console.log()
    
    console.log('Last Month (April 2026):')
    console.log(`  Orders: ${lastMonthMetrics.count}`)
    console.log(`  Revenue: ₱${lastMonthMetrics.revenue.toLocaleString()}`)
    console.log()
    
    console.log('Change:')
    console.log(`  Revenue: +₱${(thisMonthMetrics.revenue - lastMonthMetrics.revenue).toLocaleString()}`)
    console.log()
    
    console.log('Expected on Dashboard (Month tab):')
    console.log(`  This Month: ₱${thisMonthMetrics.revenue.toLocaleString()} (${thisMonthMetrics.count} units sold)`)
    console.log(`  Last Month: ₱${lastMonthMetrics.revenue.toLocaleString()}`)
    console.log(`  Change: +₱${(thisMonthMetrics.revenue - lastMonthMetrics.revenue).toLocaleString()}`)
    console.log()

    // Detailed breakdown by day for this week
    console.log('📊 THIS WEEK DAILY BREAKDOWN:')
    console.log('─'.repeat(80))
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart)
      dayStart.setDate(dayStart.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayOrders = filterByDateRange(allOrders, dayStart, dayEnd)
      const dayMetrics = calculateMetrics(dayOrders)
      
      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      console.log(`${dayName}: ₱${dayMetrics.revenue.toLocaleString()} (${dayMetrics.count} orders)`)
    }
    console.log()

    // Detailed breakdown by day for this month
    console.log('📊 THIS MONTH DAILY BREAKDOWN (last 7 days):')
    console.log('─'.repeat(80))
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayOrders = filterByDateRange(allOrders, dayStart, dayEnd)
      const dayMetrics = calculateMetrics(dayOrders)
      
      const dayName = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      console.log(`${dayName}: ₱${dayMetrics.revenue.toLocaleString()} (${dayMetrics.count} orders)`)
    }
    console.log()

    console.log('='.repeat(80))
    console.log('✅ VERIFICATION COMPLETE')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyDashboardTabs()
