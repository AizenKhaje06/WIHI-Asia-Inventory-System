const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Key:', supabaseServiceKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  try {
    console.log('\nFetching accounts...')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('role')
    
    if (error) {
      console.error('Error:', error.message)
      return
    }
    
    console.log(`\nFound ${data.length} accounts:\n`)
    
    data.forEach(account => {
      console.log(`- ${account.username} (${account.role})`)
      if (account.role === 'team_leader') {
        console.log(`  Channel: ${account.assigned_channel || 'Not set'}`)
      }
      console.log(`  Password: ${account.password ? 'Set' : 'Missing'}`)
      console.log('')
    })
    
  } catch (err) {
    console.error('Fatal error:', err.message)
  }
}

test()
