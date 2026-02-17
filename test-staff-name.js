// Test script to check if staff_name column exists and data is being saved
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  console.log('Testing staff_name column...\n')
  
  // 1. Check if column exists
  const { data: logs, error } = await supabase
    .from('logs')
    .select('id, staff_name, details, timestamp')
    .order('timestamp', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('❌ Error reading logs:', error.message)
    return
  }
  
  console.log('✅ Successfully read logs')
  console.log('Latest 5 logs:\n')
  
  logs.forEach((log, i) => {
    console.log(`${i + 1}. ID: ${log.id}`)
    console.log(`   staff_name: ${log.staff_name || 'NULL'}`)
    console.log(`   details: ${log.details.substring(0, 80)}...`)
    console.log(`   timestamp: ${log.timestamp}\n`)
  })
  
  // 2. Try to insert a test log with staff_name
  console.log('Attempting to insert test log with staff_name...')
  const { data: inserted, error: insertError } = await supabase
    .from('logs')
    .insert({
      id: 'TEST-' + Date.now(),
      operation: 'test',
      item_id: 'TEST',
      item_name: 'Test Item',
      details: 'Test log entry',
      staff_name: 'TEST USER',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    })
    .select()
  
  if (insertError) {
    console.error('❌ Insert failed:', insertError.message)
  } else {
    console.log('✅ Test log inserted successfully!')
    console.log('Inserted data:', inserted)
  }
}

test().then(() => process.exit(0))
