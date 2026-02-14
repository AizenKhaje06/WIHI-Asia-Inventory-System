/**
 * Fix Log Operations Script
 * 
 * Updates existing logs in Supabase to have correct operation types
 * based on the department/details field
 */

import { supabaseAdmin } from '../lib/supabase'

async function fixLogOperations() {
  console.log('Starting log operations fix...')

  try {
    // Get all logs
    const { data: logs, error: fetchError } = await supabaseAdmin
      .from('logs')
      .select('*')

    if (fetchError) {
      console.error('Error fetching logs:', fetchError)
      return
    }

    console.log(`Found ${logs?.length || 0} logs to process`)

    let updated = 0
    let skipped = 0

    // Process each log
    for (const log of logs || []) {
      let newOperation = log.operation

      // Check details to determine correct operation
      const details = log.details?.toLowerCase() || ''
      
      if (details.includes('demo/display') || details.includes('demo / display')) {
        newOperation = 'demo-display'
      } else if (details.includes('internal use') || details.includes('internal-use')) {
        newOperation = 'internal-usage'
      } else if (details.includes('warehouse') || details.includes('transferred')) {
        newOperation = 'warehouse'
      } else if (details.includes('dispatched') || log.operation === 'dispatch' || log.operation === 'other') {
        newOperation = 'sale'
      } else if (log.operation === 'demo') {
        newOperation = 'demo-display'
      } else if (log.operation === 'internal' || log.operation === 'transfer') {
        newOperation = 'internal-usage'
      }

      // Update if operation changed
      if (newOperation !== log.operation) {
        const { error: updateError } = await supabaseAdmin
          .from('logs')
          .update({ operation: newOperation })
          .eq('id', log.id)

        if (updateError) {
          console.error(`Error updating log ${log.id}:`, updateError)
        } else {
          console.log(`✓ Updated log ${log.id}: ${log.operation} → ${newOperation}`)
          updated++
        }
      } else {
        skipped++
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Total logs: ${logs?.length || 0}`)
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    console.log('✓ Log operations fix completed!')

  } catch (error) {
    console.error('Error fixing log operations:', error)
  }
}

// Run the script
fixLogOperations()
