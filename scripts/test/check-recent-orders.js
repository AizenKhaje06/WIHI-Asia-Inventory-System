const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkRecentOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, product, total, packed_at, date, parcel_status')
    .eq('status', 'Packed')
    .order('packed_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Last 10 packed orders:')
  console.log()
  data.forEach((o, i) => {
    const packedDate = new Date(o.packed_at)
    console.log(`${i + 1}. ${o.product}`)
    console.log(`   Amount: ₱${o.total}`)
    console.log(`   Packed at: ${packedDate.toLocaleString()}`)
    console.log(`   Parcel Status: ${o.parcel_status}`)
    console.log()
  })

  // Check today's orders
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  console.log('Today range:')
  console.log(`  Start: ${today.toLocaleString()}`)
  console.log(`  End: ${todayEnd.toLocaleString()}`)
  console.log()

  const todayOrders = data.filter(o => {
    const packedDate = new Date(o.packed_at)
    return packedDate >= today && packedDate <= todayEnd
  })

  console.log(`Orders packed today: ${todayOrders.length}`)
  if (todayOrders.length > 0) {
    todayOrders.forEach(o => {
      console.log(`  - ${o.product}: ₱${o.total}`)
    })
  }
}

checkRecentOrders().catch(console.error)
