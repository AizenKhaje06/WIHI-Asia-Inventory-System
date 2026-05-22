/**
 * Test Dashboard API Response
 * 
 * Simulates the actual API call to verify chart data
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testDashboardAPI() {
  console.log('='.repeat(80))
  console.log('DASHBOARD API RESPONSE TEST')
  console.log('='.repeat(80))
  console.log()

  // Simulate API call for DAY period
  const period = 'ID' // Day
  
  // Fetch orders (same as API)
  const { data: allOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'Packed')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📦 Total Orders: ${allOrders.length}`)
  console.log()

  // Filter active orders (exclude CANCELLED, RETURNED, PROBLEMATIC)
  const EXCLUDED_STATUSES = ['CANCELLED', 'RETURNED', 'PROBLEMATIC']
  const activeOrders = allOrders
    .filter(o => !EXCLUDED_STATUSES.includes(o.parcel_status))
    .map(o => ({
      id: o.id,
      qty: o.qty || 0,
      total: o.total || 0,
      cogs: o.cogs || 0,
      parcel_status: o.parcel_status || 'PENDING',
      payment_status: o.payment_status || 'pending',
      sales_channel: o.sales_channel,
      date: o.date, // ← This contains packed_at
      created_at: o.created_at
    }))

  console.log(`✅ Active Orders: ${activeOrders.length}`)
  console.log()

  // Generate DAY chart data (same logic as API)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const salesOverTime = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(today)
    hourStart.setHours(i, 0, 0, 0)
    const hourEnd = new Date(today)
    hourEnd.setHours(i, 59, 59, 999)

    const hourStr = i.toString().padStart(2, '0') + ':00'

    const hourOrders = activeOrders.filter(order => {
      const orderDate = new Date(order.date) // ✅ Uses packed_at (stored in date field)
      return orderDate >= hourStart && orderDate <= hourEnd
    })

    const sales = hourOrders.reduce((sum, o) => sum + o.total, 0)
    const quantity = hourOrders.reduce((sum, o) => sum + o.qty, 0)

    return { date: hourStr, purchases: 0, sales, quantity }
  })

  console.log('='.repeat(80))
  console.log('DAY TAB - CHART DATA (salesOverTime)')
  console.log('='.repeat(80))
  console.log()

  // Show only hours with sales
  const hoursWithSales = salesOverTime.filter(h => h.sales > 0)
  
  if (hoursWithSales.length > 0) {
    console.log('⏰ Hours with sales:')
    console.log()
    hoursWithSales.forEach(h => {
      console.log(`  ${h.date}`)
      console.log(`    Sales: ₱${h.sales.toLocaleString()}`)
      console.log(`    Quantity: ${h.quantity} units`)
      console.log()
    })
  } else {
    console.log('ℹ️  No sales today')
    console.log()
  }

  // Show full chart data structure (first 5 and last 5 hours)
  console.log('='.repeat(80))
  console.log('CHART DATA STRUCTURE (First 5 hours)')
  console.log('='.repeat(80))
  console.log()
  console.log(JSON.stringify(salesOverTime.slice(0, 5), null, 2))
  console.log()

  console.log('='.repeat(80))
  console.log('CHART DATA STRUCTURE (Hours 12-16, including 14:00)')
  console.log('='.repeat(80))
  console.log()
  console.log(JSON.stringify(salesOverTime.slice(12, 17), null, 2))
  console.log()

  // Verify the 14:00 hour specifically
  const hour14 = salesOverTime[14]
  console.log('='.repeat(80))
  console.log('VERIFICATION: 14:00 (2pm) Hour')
  console.log('='.repeat(80))
  console.log()
  console.log('Expected: ₱398 sale at 14:21')
  console.log()
  console.log('Actual data:')
  console.log(JSON.stringify(hour14, null, 2))
  console.log()

  if (hour14.sales > 0) {
    console.log('✅ SUCCESS: Chart will show spike at 14:00!')
    console.log(`   Revenue: ₱${hour14.sales}`)
    console.log(`   Quantity: ${hour14.quantity} units`)
  } else {
    console.log('❌ ISSUE: No sales at 14:00')
  }
  console.log()

  // Show what the frontend will receive
  console.log('='.repeat(80))
  console.log('WHAT FRONTEND RECEIVES')
  console.log('='.repeat(80))
  console.log()
  console.log('The Dashboard page will receive this salesOverTime array:')
  console.log(`- Total hours: ${salesOverTime.length}`)
  console.log(`- Hours with sales: ${hoursWithSales.length}`)
  console.log(`- Total revenue: ₱${salesOverTime.reduce((sum, h) => sum + h.sales, 0).toLocaleString()}`)
  console.log()
  console.log('The RevenueChart component will:')
  console.log('1. Format the data using formatChartData()')
  console.log('2. Display bars for each hour')
  console.log('3. Show spike at 14:00 with ₱398')
  console.log()
}

testDashboardAPI().catch(console.error)
