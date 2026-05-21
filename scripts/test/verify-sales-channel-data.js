/**
 * Sales Channel Data Accuracy Verification Script
 * Verifies parcel status counts, amounts, and percentages
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyData() {
  console.log('='.repeat(80))
  console.log('SALES CHANNEL DATA ACCURACY VERIFICATION')
  console.log('='.repeat(80))
  console.log()

  try {
    // Get all orders with status='Packed' (Track Orders only)
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

    // Group by sales channel
    const channelMap = new Map()

    allOrders.forEach(order => {
      const channel = order.sales_channel || 'Unknown'
      if (!channelMap.has(channel)) {
        channelMap.set(channel, [])
      }
      channelMap.get(channel).push(order)
    })

    console.log(`📍 Sales Channels Found: ${channelMap.size}`)
    console.log()

    // Analyze each channel
    for (const [channelName, orders] of channelMap.entries()) {
      console.log('─'.repeat(80))
      console.log(`📦 CHANNEL: ${channelName}`)
      console.log('─'.repeat(80))
      console.log()

      const totalOrders = orders.length
      console.log(`Total Orders: ${totalOrders}`)
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

      orders.forEach(order => {
        const status = order.parcel_status || 'OTHER'
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++
          statusAmounts[status] += order.total || 0
        } else {
          statusCounts.OTHER++
          statusAmounts.OTHER += order.total || 0
        }
      })

      // Calculate derived metrics
      const pendingCount = statusCounts.PENDING
      const pendingAmount = statusAmounts.PENDING
      const pendingPercentage = totalOrders > 0 ? (pendingCount / totalOrders) * 100 : 0

      const undeliveredCount = statusCounts['IN TRANSIT'] + statusCounts['ON DELIVERY'] + 
                               statusCounts.PICKUP + statusCounts.DETAINED
      const undeliveredAmount = statusAmounts['IN TRANSIT'] + statusAmounts['ON DELIVERY'] + 
                                statusAmounts.PICKUP + statusAmounts.DETAINED
      const undeliveredPercentage = totalOrders > 0 ? (undeliveredCount / totalOrders) * 100 : 0

      const deliveredCount = statusCounts.DELIVERED
      const deliveredAmount = statusAmounts.DELIVERED
      const deliveredPercentage = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0

      const lossRevenueCount = statusCounts.RETURNED + statusCounts.CANCELLED + statusCounts.PROBLEMATIC
      const lossRevenueAmount = statusAmounts.RETURNED + statusAmounts.CANCELLED + statusAmounts.PROBLEMATIC
      const lossRevenuePercentage = totalOrders > 0 ? (lossRevenueCount / totalOrders) * 100 : 0

      // Display results
      console.log('📋 PARCEL STATUS BREAKDOWN:')
      console.log()
      
      console.log('1️⃣  PENDING CARD:')
      console.log(`   Count: ${pendingCount}`)
      console.log(`   Amount: ₱${pendingAmount.toLocaleString()}`)
      console.log(`   Percentage: ${pendingPercentage.toFixed(1)}%`)
      console.log()

      console.log('2️⃣  UNDELIVERED CARD (IN TRANSIT + ON DELIVERY + PICKUP + DETAINED):')
      console.log(`   Count: ${undeliveredCount}`)
      console.log(`   Amount: ₱${undeliveredAmount.toLocaleString()}`)
      console.log(`   Percentage: ${undeliveredPercentage.toFixed(1)}%`)
      console.log(`   Breakdown:`)
      console.log(`     - IN TRANSIT: ${statusCounts['IN TRANSIT']} (₱${statusAmounts['IN TRANSIT'].toLocaleString()})`)
      console.log(`     - ON DELIVERY: ${statusCounts['ON DELIVERY']} (₱${statusAmounts['ON DELIVERY'].toLocaleString()})`)
      console.log(`     - PICKUP: ${statusCounts.PICKUP} (₱${statusAmounts.PICKUP.toLocaleString()})`)
      console.log(`     - DETAINED: ${statusCounts.DETAINED} (₱${statusAmounts.DETAINED.toLocaleString()})`)
      console.log()

      console.log('3️⃣  DELIVERED CARD:')
      console.log(`   Count: ${deliveredCount}`)
      console.log(`   Amount: ₱${deliveredAmount.toLocaleString()}`)
      console.log(`   Percentage: ${deliveredPercentage.toFixed(1)}%`)
      console.log()

      console.log('4️⃣  LOSS REVENUE CARD (RETURNED + CANCELLED + PROBLEMATIC):')
      console.log(`   Count: ${lossRevenueCount}`)
      console.log(`   Amount: ₱${lossRevenueAmount.toLocaleString()}`)
      console.log(`   Percentage: ${lossRevenuePercentage.toFixed(1)}%`)
      console.log(`   Breakdown:`)
      console.log(`     - RETURNED: ${statusCounts.RETURNED} (₱${statusAmounts.RETURNED.toLocaleString()}) - ${totalOrders > 0 ? ((statusCounts.RETURNED / totalOrders) * 100).toFixed(1) : 0}%`)
      console.log(`     - CANCELLED: ${statusCounts.CANCELLED} (₱${statusAmounts.CANCELLED.toLocaleString()}) - ${totalOrders > 0 ? ((statusCounts.CANCELLED / totalOrders) * 100).toFixed(1) : 0}%`)
      console.log(`     - PROBLEMATIC: ${statusCounts.PROBLEMATIC} (₱${statusAmounts.PROBLEMATIC.toLocaleString()}) - ${totalOrders > 0 ? ((statusCounts.PROBLEMATIC / totalOrders) * 100).toFixed(1) : 0}%`)
      console.log()

      // Verification
      const totalCalculated = pendingCount + undeliveredCount + deliveredCount + lossRevenueCount + statusCounts.OTHER
      const percentageSum = pendingPercentage + undeliveredPercentage + deliveredPercentage + lossRevenuePercentage + 
                           (totalOrders > 0 ? (statusCounts.OTHER / totalOrders) * 100 : 0)

      console.log('✅ VERIFICATION:')
      console.log(`   Total Orders: ${totalOrders}`)
      console.log(`   Sum of All Categories: ${totalCalculated}`)
      console.log(`   Match: ${totalOrders === totalCalculated ? '✅ YES' : '❌ NO'}`)
      console.log(`   Percentage Sum: ${percentageSum.toFixed(1)}%`)
      console.log(`   Should be ~100%: ${Math.abs(percentageSum - 100) < 0.1 ? '✅ YES' : '❌ NO'}`)
      
      if (statusCounts.OTHER > 0) {
        console.log(`   ⚠️  Warning: ${statusCounts.OTHER} orders with OTHER/unknown status`)
      }
      console.log()

      // Revenue calculation (exclude CANCELLED, RETURNED, PROBLEMATIC)
      const activeOrders = orders.filter(o => 
        !['CANCELLED', 'RETURNED', 'PROBLEMATIC'].includes(o.parcel_status)
      )
      const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      const totalCost = activeOrders.reduce((sum, o) => sum + (o.cogs || (o.total * 0.6)), 0)
      const totalProfit = totalRevenue - totalCost

      console.log('💰 REVENUE METRICS (Active Orders Only):')
      console.log(`   Active Orders: ${activeOrders.length} (excludes CANCELLED, RETURNED, PROBLEMATIC)`)
      console.log(`   Total Revenue: ₱${totalRevenue.toLocaleString()}`)
      console.log(`   Total Cost: ₱${totalCost.toLocaleString()}`)
      console.log(`   Total Profit: ₱${totalProfit.toLocaleString()}`)
      console.log(`   Profit Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`)
      console.log()
    }

    console.log('='.repeat(80))
    console.log('✅ VERIFICATION COMPLETE')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyData()
