/**
 * Test what API returns when date filter has no results
 */

async function testEmptyDateFilter() {
  console.log('='.repeat(80))
  console.log('TEST: API Response with Empty Date Filter')
  console.log('='.repeat(80))
  console.log()

  try {
    const channel = 'Facebook'
    const startDate = '2026-05-22'
    const endDate = '2026-05-22'
    
    console.log(`Testing: ${channel} from ${startDate} to ${endDate}`)
    console.log()

    const response = await fetch(
      `http://localhost:3000/api/departments/${encodeURIComponent(channel)}?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Cookie': 'auth-token=your-token-here' // You'll need to add your actual token
        }
      }
    )

    const data = await response.json()
    
    console.log('API Response:')
    console.log('─'.repeat(80))
    console.log()
    
    console.log('Metrics:')
    console.log(`  Revenue: ₱${data.department.metrics.totalRevenue}`)
    console.log(`  Cost: ₱${data.department.metrics.totalCost}`)
    console.log(`  Profit: ₱${data.department.metrics.totalProfit}`)
    console.log(`  Order Count: ${data.department.metrics.transactionCount}`)
    console.log()
    
    console.log('Parcel Status Counts:')
    console.log(`  Pending: ${data.department.parcelStatusCounts.pending}`)
    console.log(`  Undelivered: ${data.department.parcelStatusCounts.undelivered}`)
    console.log(`  Delivered: ${data.department.parcelStatusCounts.delivered}`)
    console.log(`  Loss Revenue: ${data.department.parcelStatusCounts.lossRevenue}`)
    console.log(`  Total: ${data.department.parcelStatusCounts.total}`)
    console.log()
    
    console.log('Expected Results (when no orders):')
    console.log('  All metrics should be 0')
    console.log('  All counts should be 0')
    console.log()
    
    const isCorrect = 
      data.department.metrics.totalRevenue === 0 &&
      data.department.metrics.transactionCount === 0 &&
      data.department.parcelStatusCounts.total === 0
    
    if (isCorrect) {
      console.log('✅ API is returning correct empty data!')
    } else {
      console.log('❌ API is returning non-zero data when it should be empty!')
      console.log()
      console.log('This means the date filter is NOT working correctly.')
    }
    
    console.log()
    console.log('='.repeat(80))

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testEmptyDateFilter()
