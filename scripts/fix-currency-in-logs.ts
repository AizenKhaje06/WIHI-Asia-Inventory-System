/**
 * Script to fix currency symbols in existing logs
 * Replaces $ with ₱ in log details
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixCurrencyInLogs() {
  console.log('🔧 Starting currency fix in logs...')
  
  try {
    // Fetch all logs
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching logs:', error)
      return
    }
    
    if (!logs || logs.length === 0) {
      console.log('ℹ️  No logs found')
      return
    }
    
    console.log(`📊 Found ${logs.length} logs`)
    
    // Find logs with dollar signs
    const logsToFix = logs.filter(log => log.details?.includes('$'))
    
    if (logsToFix.length === 0) {
      console.log('✅ No logs need fixing - all currency symbols are correct!')
      return
    }
    
    console.log(`🔄 Fixing ${logsToFix.length} logs with dollar signs...`)
    
    // Update each log
    let fixed = 0
    let failed = 0
    
    for (const log of logsToFix) {
      const updatedDetails = log.details.replace(/\$/g, '₱')
      
      const { error: updateError } = await supabase
        .from('logs')
        .update({ details: updatedDetails })
        .eq('id', log.id)
      
      if (updateError) {
        console.error(`❌ Failed to update log ${log.id}:`, updateError)
        failed++
      } else {
        fixed++
        console.log(`✅ Fixed log ${log.id}: ${log.itemName}`)
      }
    }
    
    console.log('\n📈 Summary:')
    console.log(`   ✅ Fixed: ${fixed}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📊 Total: ${logsToFix.length}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
fixCurrencyInLogs()
  .then(() => {
    console.log('\n✨ Script completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
