/**
 * Check today's sales - May 22, 2026
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTodaysSales() {
  console.log('='.repeat(80))
  console.log('CHECKING TODAY\'S SALES - MAY 22, 2026')
  console.log('='.repeat(80))
  console.log()

  try {
    const today = '2026-05-22'
    
    // Check 1: All orders created today
    console.log('CHECK 1: Orders created today (any status)')
    console.log('─'.repeat(80))
    
    const { data: createdToday, error: error1 } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59')
      .order('created_at', { ascending: false })

    if (error1) {
      console.error('Error:', error1)
      return
    }

    console.log(`Total orders created today: ${createdToday.length}`)
    if (createdToday.length > 0) {
      console.log()
      createdToday.forEach((order, i) => {
        console.log(`${i + 1}. Order ${order.id}:`)
        console.log(`   Status: ${order.status}`)
        console.log(`   Parcel Status: ${order.parcel_status}`)
        console.log(`   Created: ${order.created_at}`)
        console.log(`   Packed: ${order.packed_at || 'NOT PACKED YET'}`)
        console.log(`   Amount: ₱${order.total}`)
        console.log()
      })
    }
    console.log()

    // Check 2: Orders packed today (what Dashboard shows)
    console.log('CHECK 2: Orders PACKED today (status=\'Packed\')')
    console.log('─'.repeat(80))
    
    const { data: packedToday, error: error2 } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Packed')
      .gte('packed_at', today)
      .lte('packed_at', today + 'T23:59:59')
      .order('packed_at', { ascending: false })

    if (error2) {
      console.error('Error:', error2)
      return
    }

    console.log(`Total orders PACKED today: ${packedToday.length}`)
    if (packedToday.length > 0) {
      console.log()
      packedToday.forEach((order, i) => {
        console.log(`${i + 1}. Order ${order.id}:`)
        console.log(`   Status: ${order.status}`)
        console.log(`   Parcel Status: ${order.parcel_status}`)
        console.log(`   Created: ${order.created_at}`)
        console.log(`   Packed: ${order.packed_at}`)
        console.log(`   Amount: ₱${order.total}`)
        console.log()
      })
      
      const totalRevenue = packedToday.reduce((sum, o) => sum + (o.total || 0), 0)
      console.log(`Total Revenue (packed today): ₱${totalRevenue.toLocaleString()}`)
    } else {
      console.log('⚠️  NO ORDERS PACKED TODAY!')
      console.log()
      console.log('💡 REASON: Dashboard only shows orders with status=\'Packed\'')
      console.log('   If the sale at 2pm is still status=\'Pending\', it won\'t show on Dashboard.')
    }
    console.log()

    // Check 3: Orders around 2pm today
    console.log('CHECK 3: Orders created around 2pm today (14:00)')
    console.log('─'.repeat(80))
    
    const { data: around2pm, error: error3 } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', today + 'T13:00:00')
      .lte('created_at', today + 'T15:00:00')
      .order('created_at', { ascending: false })

    if (error3) {
      console.error('Error:', error3)
      return
    }

    console.log(`Orders created between 1pm-3pm: ${around2pm.length}`)
    if (around2pm.length > 0) {
      console.log()
      around2pm.forEach((order, i) => {
        console.log(`${i + 1}. Order ${order.id}:`)
        console.log(`   Status: ${order.status} ${order.status === 'Pending' ? '← NOT PACKED YET!' : ''}`)
        console.log(`   Parcel Status: ${order.parcel_status}`)
        console.log(`   Created: ${order.created_at}`)
        console.log(`   Packed: ${order.packed_at || 'NOT PACKED YET'}`)
        console.log(`   Amount: ₱${order.total}`)
        console.log(`   Product: ${order.product}`)
        console.log()
      })
    } else {
      console.log('⚠️  No orders found around 2pm')
    }
    console.log()

    // Summary
    console.log('='.repeat(80))
    console.log('📊 SUMMARY')
    console.log('='.repeat(80))
    console.log()
    console.log(`Orders created today: ${createdToday.length}`)
    console.log(`Orders PACKED today: ${packedToday.length}`)
    console.log(`Orders around 2pm: ${around2pm.length}`)
    console.log()
    
    if (createdToday.length > 0 && packedToday.length === 0) {
      console.log('⚠️  ISSUE FOUND:')
      console.log('   You have orders created today, but NONE are packed yet.')
      console.log('   Dashboard only shows orders with status=\'Packed\'.')
      console.log()
      console.log('💡 SOLUTION:')
      console.log('   1. Go to Packing Queue page')
      console.log('   2. Find the order from 2pm')
      console.log('   3. Click "Pack" button')
      console.log('   4. Then it will appear on Dashboard')
    } else if (packedToday.length > 0) {
      console.log('✅ Orders are packed and should show on Dashboard')
    } else {
      console.log('⚠️  No orders found today at all')
    }
    console.log()
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkTodaysSales()
