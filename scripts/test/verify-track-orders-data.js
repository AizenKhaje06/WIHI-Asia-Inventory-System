/**
 * Track Orders Data Accuracy Verification Script
 * Verifies order counts and amounts by parcel status
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyData() {
  console.log('='.repeat(80))
  console.log('TRACK ORDERS DATA ACCURACY VERIFICATION')
  console.log('='.repeat(80))
  console.log()

  try {
    // Get all orders with status='Packed' (Track Orders page shows only Packed orders)
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .order('packed_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching orders:', error)
      return
    }

    console.log(`📊 Total Orders (status='Packed'): ${allOrders.length}`)
    console.log()

    // Count by parcel status
    const statusCounts = {
      PENDING: 0,
      'IN TRANSIT': 0,
      'ON DELIVERY': 0,
      PICKUP: 0,
      DETAINED: 0,
      DELIVERED: 0,
      RETURNED: 0,
      CANCELLED: 0,
      PROBLEMATIC: 0,
      OTHER: 0
    }

    const statusAmounts = {
      PENDING: 0,
      'IN TRANSIT': 0,
      'ON DELIVERY': 0,
      PICKUP: 0,
      DETAINED: 0,
      DELIVERED: 0,
      RETURNED: 0,
      CANCELLED: 0,
      PROBLEMATIC: 0,
      OTHER: 0
    }

    allOrders.forEach(order => {
      const status = order.parcel_status || 'OTHER'
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++
        statusAmounts[status] += order.total || 0
      } else {
        statusCounts.OTHER++
        statusAmounts.OTHER += order.total || 0
      }
    })

    console.log('📋 PARCEL STATUS BREAKDOWN:')
    console.log()

    // Display all statuses
    Object.keys(statusCounts).forEach(status => {
      if (statusCounts[status] > 0) {
        console.log(`${status}:`)
        console.log(`  Count: ${statusCounts[status]}`)
        console.log(`  Amount: ₱${statusAmounts[status].toLocaleString()}`)
        console.log()
      }
    })

    // Calculate totals
    const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    const totalAmount = Object.values(statusAmounts).reduce((sum, amount) => sum + amount, 0)

    console.log('─'.repeat(80))
    console.log('📊 TOTALS:')
    console.log(`  Total Orders: ${totalCount}`)
    console.log(`  Total Amount: ₱${totalAmount.toLocaleString()}`)
    console.log()

    // Verify against database count
    console.log('✅ VERIFICATION:')
    console.log(`  Database Count: ${allOrders.length}`)
    console.log(`  Calculated Count: ${totalCount}`)
    console.log(`  Match: ${allOrders.length === totalCount ? '✅ YES' : '❌ NO'}`)
    console.log()

    // Group by sales channel
    console.log('─'.repeat(80))
    console.log('📍 BREAKDOWN BY SALES CHANNEL:')
    console.log()

    const channelMap = new Map()
    allOrders.forEach(order => {
      const channel = order.sales_channel || 'Unknown'
      if (!channelMap.has(channel)) {
        channelMap.set(channel, { count: 0, amount: 0 })
      }
      const data = channelMap.get(channel)
      data.count++
      data.amount += order.total || 0
    })

    for (const [channel, data] of channelMap.entries()) {
      console.log(`${channel}:`)
      console.log(`  Orders: ${data.count}`)
      console.log(`  Amount: ₱${data.amount.toLocaleString()}`)
      console.log()
    }

    // Active vs Excluded orders
    console.log('─'.repeat(80))
    console.log('💰 REVENUE CALCULATION:')
    console.log()

    const activeOrders = allOrders.filter(o => 
      !['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(o.parcel_status)
    )
    const excludedOrders = allOrders.filter(o => 
      ['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(o.parcel_status)
    )

    const activeAmount = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const excludedAmount = excludedOrders.reduce((sum, o) => sum + (o.total || 0), 0)

    console.log('Active Orders (included in revenue):')
    console.log(`  Count: ${activeOrders.length}`)
    console.log(`  Amount: ₱${activeAmount.toLocaleString()}`)
    console.log()

    console.log('Excluded Orders (CANCELLED, RETURNED, PROBLEMATIC):')
    console.log(`  Count: ${excludedOrders.length}`)
    console.log(`  Amount: ₱${excludedAmount.toLocaleString()}`)
    console.log()

    console.log('Total:')
    console.log(`  Count: ${activeOrders.length + excludedOrders.length}`)
    console.log(`  Amount: ₱${(activeAmount + excludedAmount).toLocaleString()}`)
    console.log()

    // Payment status breakdown
    console.log('─'.repeat(80))
    console.log('💳 PAYMENT STATUS BREAKDOWN:')
    console.log()

    const paymentCounts = {
      pending: 0,
      paid: 0,
      cod: 0,
      refunded: 0,
      other: 0
    }

    const paymentAmounts = {
      pending: 0,
      paid: 0,
      cod: 0,
      refunded: 0,
      other: 0
    }

    allOrders.forEach(order => {
      const status = order.payment_status || 'other'
      if (paymentCounts.hasOwnProperty(status)) {
        paymentCounts[status]++
        paymentAmounts[status] += order.total || 0
      } else {
        paymentCounts.other++
        paymentAmounts.other += order.total || 0
      }
    })

    Object.keys(paymentCounts).forEach(status => {
      if (paymentCounts[status] > 0) {
        console.log(`${status.toUpperCase()}:`)
        console.log(`  Count: ${paymentCounts[status]}`)
        console.log(`  Amount: ₱${paymentAmounts[status].toLocaleString()}`)
        console.log()
      }
    })

    console.log('='.repeat(80))
    console.log('✅ VERIFICATION COMPLETE')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyData()
