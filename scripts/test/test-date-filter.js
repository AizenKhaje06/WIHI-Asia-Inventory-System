/**
 * Test Date Filter on Sales Channels
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDateFilter() {
  console.log('='.repeat(80))
  console.log('DATE FILTER TEST - SALES CHANNELS')
  console.log('='.repeat(80))
  console.log()

  try {
    const channel = 'Facebook'
    
    // Test 1: Get ALL orders for Facebook (no date filter)
    console.log('TEST 1: All Facebook orders (no date filter)')
    console.log('─'.repeat(80))
    
    const { data: allOrders, error: error1 } = await supabase
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)
      .eq('status', 'Packed')
      .order('packed_at', { ascending: false })

    if (error1) {
      console.error('Error:', error1)
      return
    }

    console.log(`Total orders: ${allOrders.length}`)
    console.log()
    
    // Show all packed_at dates
    console.log('Packed dates:')
    allOrders.forEach((order, i) => {
      console.log(`  ${i + 1}. Order ${order.id}: packed_at = ${order.packed_at || 'NULL'}`)
    })
    console.log()

    // Test 2: Filter by date range (May 22, 2026)
    console.log('TEST 2: Filter to May 22, 2026 only')
    console.log('─'.repeat(80))
    
    const startDate = '2026-05-22'
    const endDate = '2026-05-22'
    
    const { data: filteredOrders, error: error2 } = await supabase
      .from('orders')
      .select('*')
      .eq('sales_channel', channel)
      .eq('status', 'Packed')
      .gte('packed_at', startDate)
      .lte('packed_at', endDate)
      .order('packed_at', { ascending: false })

    if (error2) {
      console.error('Error:', error2)
      return
    }

    console.log(`Filtered orders (${startDate} to ${endDate}): ${filteredOrders.length}`)
    console.log()
    
    if (filteredOrders.length > 0) {
      console.log('Filtered orders:')
      filteredOrders.forEach((order, i) => {
        console.log(`  ${i + 1}. Order ${order.id}: packed_at = ${order.packed_at}, amount = ₱${order.total}`)
      })
    } else {
      console.log('⚠️  No orders found for this date range')
    }
    console.log()

    // Test 3: Check if packed_at is NULL for any orders
    console.log('TEST 3: Check for NULL packed_at values')
    console.log('─'.repeat(80))
    
    const ordersWithNullPackedAt = allOrders.filter(o => !o.packed_at)
    console.log(`Orders with NULL packed_at: ${ordersWithNullPackedAt.length}`)
    
    if (ordersWithNullPackedAt.length > 0) {
      console.log('⚠️  WARNING: Some orders have NULL packed_at!')
      ordersWithNullPackedAt.forEach((order, i) => {
        console.log(`  ${i + 1}. Order ${order.id}: date = ${order.date}, packed_at = NULL`)
      })
      console.log()
      console.log('💡 SOLUTION: These orders need packed_at values for date filtering to work!')
    }
    console.log()

    // Test 4: Show date range of all orders
    console.log('TEST 4: Date range analysis')
    console.log('─'.repeat(80))
    
    const ordersWithPackedAt = allOrders.filter(o => o.packed_at)
    if (ordersWithPackedAt.length > 0) {
      const dates = ordersWithPackedAt.map(o => new Date(o.packed_at))
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
      
      console.log(`Earliest packed_at: ${minDate.toISOString().split('T')[0]}`)
      console.log(`Latest packed_at: ${maxDate.toISOString().split('T')[0]}`)
      console.log()
      console.log(`Date range: ${Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))} days`)
    }
    console.log()

    console.log('='.repeat(80))
    console.log('✅ TEST COMPLETE')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testDateFilter()
