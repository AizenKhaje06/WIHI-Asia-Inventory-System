// Quick script to check orders and their dates
// Run with: node scripts/test/check-orders-dates.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkOrders() {
  console.log('🔍 Checking orders in database...\n')
  console.log('📋 Table: orders (Supabase)\n')

  // Get all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return
  }

  console.log(`📊 Total orders: ${orders?.length || 0}\n`)

  if (orders.length === 0 || !orders) {
    console.log('⚠️  No orders found in database!')
    console.log('\nPossible reasons:')
    console.log('1. Database is empty - no orders have been created')
    console.log('2. RLS (Row Level Security) is blocking access')
    console.log('3. Connection issue with Supabase')
    console.log('4. Wrong table name or database')
    console.log('\n💡 Solution:')
    console.log('- Check if you have orders in Supabase dashboard')
    console.log('- Go to: https://supabase.com/dashboard/project/[your-project]/editor')
    console.log('- Check the "orders" table')
    return
  }

  // Show date range
  const dates = orders.map(o => new Date(o.date))
  const earliest = new Date(Math.min(...dates))
  const latest = new Date(Math.max(...dates))

  console.log(`📅 Date Range:`)
  console.log(`   Earliest: ${earliest.toLocaleDateString()}`)
  console.log(`   Latest: ${latest.toLocaleDateString()}`)
  console.log()

  // Show orders by sales channel
  const channelMap = new Map()
  orders.forEach(order => {
    const channel = order.sales_channel || 'Unknown'
    if (!channelMap.has(channel)) {
      channelMap.set(channel, { count: 0, revenue: 0 })
    }
    const data = channelMap.get(channel)
    data.count++
    data.revenue += order.total || 0
  })

  console.log('📈 Orders by Sales Channel:')
  Array.from(channelMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .forEach(([channel, data]) => {
      console.log(`   ${channel}: ${data.count} orders, ₱${data.revenue.toLocaleString()}`)
    })
  console.log()

  // Check last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentOrders = orders.filter(o => new Date(o.date) >= thirtyDaysAgo)
  console.log(`📊 Orders in last 30 days: ${recentOrders.length}`)
  
  if (recentOrders.length === 0) {
    console.log('\n⚠️  No orders in the last 30 days!')
    console.log('This is why Sales Channels page shows 0 values.')
    console.log('\nSuggestions:')
    console.log('1. Adjust date range on Sales Channels page')
    console.log('2. Add test orders with recent dates')
    console.log('3. Check if orders have correct date format')
  } else {
    console.log('✅ Recent orders found - Sales Channels should show data')
  }

  // Show sample recent orders
  console.log('\n📋 Sample recent orders:')
  recentOrders.slice(0, 5).forEach(order => {
    console.log(`   ${order.date} | ${order.sales_channel} | ₱${order.total} | ${order.parcel_status}`)
  })
}

checkOrders().catch(console.error)
