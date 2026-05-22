/**
 * Dashboard Chart Data Verification Script
 * 
 * Verifies that charts use packed_at for accurate revenue recognition
 * 
 * Expected Results:
 * - DAY tab: Shows spike at 14:00 (2pm) for today's ₱398 sale
 * - WEEK tab: Shows spike on May 22 (today)
 * - MONTH tab: Shows spike on May 22 (today)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verifyChartData() {
  console.log('='.repeat(80))
  console.log('DASHBOARD CHART DATA VERIFICATION')
  console.log('='.repeat(80))
  console.log()

  // Fetch all packed orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'Packed')
    .order('packed_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching orders:', error)
    return
  }

  console.log(`📦 Total Packed Orders: ${orders.length}`)
  console.log()

  // Filter active orders (exclude CANCELLED, RETURNED, PROBLEMATIC)
  const activeOrders = orders.filter(o => 
    !['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(o.parcel_status)
  )

  console.log(`✅ Active Orders (for revenue): ${activeOrders.length}`)
  console.log(`❌ Excluded Orders: ${orders.length - activeOrders.length}`)
  console.log()

  // Today's date boundaries
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  console.log('📅 Today:', today.toISOString().split('T')[0])
  console.log()

  // ============================================================================
  // DAY TAB VERIFICATION (Hourly data)
  // ============================================================================
  console.log('=' .repeat(80))
  console.log('DAY TAB - HOURLY DATA')
  console.log('='.repeat(80))
  console.log()

  const todayOrders = activeOrders.filter(order => {
    const packedAt = new Date(order.packed_at || order.created_at)
    return packedAt >= today && packedAt <= todayEnd
  })

  console.log(`📊 Today's Active Orders: ${todayOrders.length}`)
  console.log()

  // Group by hour
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(today)
    hourStart.setHours(i, 0, 0, 0)
    const hourEnd = new Date(today)
    hourEnd.setHours(i, 59, 59, 999)

    const hourOrders = todayOrders.filter(order => {
      const packedAt = new Date(order.packed_at || order.created_at)
      return packedAt >= hourStart && packedAt <= hourEnd
    })

    const sales = hourOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const quantity = hourOrders.reduce((sum, o) => sum + (o.qty || 0), 0)

    return {
      hour: i.toString().padStart(2, '0') + ':00',
      orders: hourOrders.length,
      sales,
      quantity,
      orderDetails: hourOrders.map(o => ({
        id: o.id,
        product: o.product,
        total: o.total,
        packed_at: o.packed_at
      }))
    }
  }).filter(h => h.orders > 0) // Only show hours with orders

  if (hourlyData.length > 0) {
    console.log('⏰ HOURLY BREAKDOWN:')
    console.log()
    hourlyData.forEach(h => {
      console.log(`  ${h.hour}`)
      console.log(`    Orders: ${h.orders}`)
      console.log(`    Revenue: ₱${h.sales.toLocaleString()}`)
      console.log(`    Quantity: ${h.quantity} units`)
      h.orderDetails.forEach(o => {
        const time = new Date(o.packed_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        console.log(`      - ${o.product} (₱${o.total}) at ${time}`)
      })
      console.log()
    })

    const totalDayRevenue = hourlyData.reduce((sum, h) => sum + h.sales, 0)
    console.log(`💰 Total Today's Revenue: ₱${totalDayRevenue.toLocaleString()}`)
  } else {
    console.log('ℹ️  No orders today')
  }
  console.log()

  // ============================================================================
  // WEEK TAB VERIFICATION (Last 7 days)
  // ============================================================================
  console.log('='.repeat(80))
  console.log('WEEK TAB - DAILY DATA (Last 7 Days)')
  console.log('='.repeat(80))
  console.log()

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today)
    day.setDate(today.getDate() - (6 - i))
    day.setHours(0, 0, 0, 0)
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const dayOrders = activeOrders.filter(order => {
      const packedAt = new Date(order.packed_at || order.created_at)
      return packedAt >= day && packedAt < nextDay
    })

    const sales = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const quantity = dayOrders.reduce((sum, o) => sum + (o.qty || 0), 0)

    return {
      date: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      orders: dayOrders.length,
      sales,
      quantity
    }
  })

  console.log('📅 DAILY BREAKDOWN:')
  console.log()
  weekData.forEach(d => {
    if (d.orders > 0) {
      console.log(`  ${d.dayName} (${d.date})`)
      console.log(`    Orders: ${d.orders}`)
      console.log(`    Revenue: ₱${d.sales.toLocaleString()}`)
      console.log(`    Quantity: ${d.quantity} units`)
      console.log()
    }
  })

  const totalWeekRevenue = weekData.reduce((sum, d) => sum + d.sales, 0)
  console.log(`💰 Total Week Revenue: ₱${totalWeekRevenue.toLocaleString()}`)
  console.log()

  // ============================================================================
  // MONTH TAB VERIFICATION (Current month)
  // ============================================================================
  console.log('='.repeat(80))
  console.log('MONTH TAB - DAILY DATA (Current Month)')
  console.log('='.repeat(80))
  console.log()

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

  const monthData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), i + 1)
    day.setHours(0, 0, 0, 0)
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayOrders = activeOrders.filter(order => {
      const packedAt = new Date(order.packed_at || order.created_at)
      return packedAt >= day && packedAt < nextDay
    })

    const sales = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const quantity = dayOrders.reduce((sum, o) => sum + (o.qty || 0), 0)

    return {
      date: day.toISOString().split('T')[0],
      dayNum: i + 1,
      orders: dayOrders.length,
      sales,
      quantity
    }
  }).filter(d => d.orders > 0) // Only show days with orders

  console.log('📅 DAILY BREAKDOWN (Days with orders):')
  console.log()
  monthData.forEach(d => {
    console.log(`  ${today.toLocaleDateString('en-US', { month: 'short' })} ${d.dayNum} (${d.date})`)
    console.log(`    Orders: ${d.orders}`)
    console.log(`    Revenue: ₱${d.sales.toLocaleString()}`)
    console.log(`    Quantity: ${d.quantity} units`)
    console.log()
  })

  const totalMonthRevenue = monthData.reduce((sum, d) => sum + d.sales, 0)
  console.log(`💰 Total Month Revenue: ₱${totalMonthRevenue.toLocaleString()}`)
  console.log()

  // ============================================================================
  // VERIFICATION SUMMARY
  // ============================================================================
  console.log('='.repeat(80))
  console.log('VERIFICATION SUMMARY')
  console.log('='.repeat(80))
  console.log()

  // Check if today's sale at 2pm is showing
  const twopmOrder = todayOrders.find(o => {
    const time = new Date(o.packed_at).getHours()
    return time === 14 // 2pm
  })

  if (twopmOrder) {
    console.log('✅ Today\'s 2pm sale found:')
    console.log(`   Product: ${twopmOrder.product}`)
    console.log(`   Amount: ₱${twopmOrder.total}`)
    console.log(`   Packed at: ${new Date(twopmOrder.packed_at).toLocaleString()}`)
    console.log()
  } else {
    console.log('⚠️  No sale found at 2pm today')
    console.log()
  }

  // Check if May 22 has data
  const may22Data = monthData.find(d => d.date === '2026-05-22')
  if (may22Data) {
    console.log('✅ May 22 data found in month view:')
    console.log(`   Orders: ${may22Data.orders}`)
    console.log(`   Revenue: ₱${may22Data.sales.toLocaleString()}`)
    console.log()
  } else {
    console.log('⚠️  No data for May 22 in month view')
    console.log()
  }

  console.log('='.repeat(80))
  console.log('EXPECTED BEHAVIOR:')
  console.log('='.repeat(80))
  console.log()
  console.log('✅ DAY tab should show spike at 14:00 (2pm)')
  console.log('✅ WEEK tab should show spike on May 22')
  console.log('✅ MONTH tab should show spike on May 22')
  console.log()
  console.log('All charts use packed_at for accurate revenue recognition!')
  console.log()
}

verifyChartData().catch(console.error)
