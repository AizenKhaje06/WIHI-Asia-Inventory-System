/**
 * Fix Order Dates - Update date field to packed_at
 * 
 * Problem: date field contains created_at instead of packed_at
 * Solution: Update all packed orders to have date = packed_at
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixOrderDates() {
  console.log('='.repeat(80))
  console.log('FIX ORDER DATES - Update date field to packed_at')
  console.log('='.repeat(80))
  console.log()

  // Get all packed orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, product, created_at, packed_at, date, status')
    .eq('status', 'Packed')
    .order('packed_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching orders:', error)
    return
  }

  console.log(`📦 Total Packed Orders: ${orders.length}`)
  console.log()

  // Find orders where date != packed_at
  const ordersToFix = orders.filter(o => {
    const dateField = o.date ? new Date(o.date).toISOString().split('T')[0] : null
    const packedDate = o.packed_at ? new Date(o.packed_at).toISOString().split('T')[0] : null
    return dateField !== packedDate
  })

  console.log(`🔧 Orders to fix: ${ordersToFix.length}`)
  console.log()

  if (ordersToFix.length === 0) {
    console.log('✅ All orders already have correct dates!')
    return
  }

  console.log('Orders with incorrect dates:')
  console.log()
  ordersToFix.forEach((o, i) => {
    console.log(`${i + 1}. ${o.product}`)
    console.log(`   ID: ${o.id}`)
    console.log(`   created_at: ${o.created_at}`)
    console.log(`   packed_at: ${o.packed_at}`)
    console.log(`   date (current): ${o.date}`)
    console.log(`   date (should be): ${o.packed_at}`)
    console.log()
  })

  console.log('='.repeat(80))
  console.log('FIXING ORDERS...')
  console.log('='.repeat(80))
  console.log()

  let fixed = 0
  let failed = 0

  for (const order of ordersToFix) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ date: order.packed_at })
      .eq('id', order.id)

    if (updateError) {
      console.error(`❌ Failed to fix order ${order.id}:`, updateError.message)
      failed++
    } else {
      console.log(`✅ Fixed order ${order.id}: ${order.product}`)
      fixed++
    }
  }

  console.log()
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log()
  console.log(`✅ Fixed: ${fixed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log()

  if (fixed > 0) {
    console.log('🎉 Orders fixed! Charts should now show correct data.')
  }
}

fixOrderDates().catch(console.error)
