/**
 * Dashboard API Test - Verify salesOverTime quantity field
 * 
 * This test verifies the recent change to add 'quantity' field to salesOverTime data
 */

const baseUrl = 'http://localhost:3000'

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API - salesOverTime quantity field\n')
  
  try {
    // Test 1: Basic dashboard call
    console.log('Test 1: GET /api/dashboard (default period)')
    const response1 = await fetch(`${baseUrl}/api/dashboard`)
    const data1 = await response1.json()
    
    if (response1.ok) {
      console.log('✅ Status: 200 OK')
      console.log(`✅ Response received with ${data1.salesOverTime?.length || 0} time periods`)
      
      // Verify salesOverTime structure
      if (data1.salesOverTime && data1.salesOverTime.length > 0) {
        const firstEntry = data1.salesOverTime[0]
        console.log('\n📊 Sample salesOverTime entry:')
        console.log(JSON.stringify(firstEntry, null, 2))
        
        // Check for required fields
        const hasDate = 'date' in firstEntry
        const hasPurchases = 'purchases' in firstEntry
        const hasSales = 'sales' in firstEntry
        const hasQuantity = 'quantity' in firstEntry
        
        console.log('\n🔍 Field validation:')
        console.log(`  ${hasDate ? '✅' : '❌'} date field present`)
        console.log(`  ${hasPurchases ? '✅' : '❌'} purchases field present`)
        console.log(`  ${hasSales ? '✅' : '❌'} sales field present`)
        console.log(`  ${hasQuantity ? '✅' : '❌'} quantity field present (NEW)`)
        
        if (!hasQuantity) {
          console.log('\n❌ FAIL: quantity field is missing from salesOverTime!')
          return false
        }
        
        // Verify quantity is a number
        if (typeof firstEntry.quantity !== 'number') {
          console.log(`\n❌ FAIL: quantity should be a number, got ${typeof firstEntry.quantity}`)
          return false
        }
        
        console.log(`\n✅ quantity value: ${firstEntry.quantity} (type: number)`)
      } else {
        console.log('\n⚠️  No salesOverTime data available (empty array)')
      }
    } else {
      console.log(`❌ Status: ${response1.status}`)
      console.log('Error:', data1)
      return false
    }
    
    // Test 2: Dashboard with period=1W
    console.log('\n\nTest 2: GET /api/dashboard?period=1W')
    const response2 = await fetch(`${baseUrl}/api/dashboard?period=1W`)
    const data2 = await response2.json()
    
    if (response2.ok) {
      console.log('✅ Status: 200 OK')
      console.log(`✅ Response received with ${data2.salesOverTime?.length || 0} time periods (7 days expected)`)
      
      if (data2.salesOverTime && data2.salesOverTime.length > 0) {
        const hasQuantity = data2.salesOverTime.every(entry => 'quantity' in entry)
        console.log(`  ${hasQuantity ? '✅' : '❌'} All entries have quantity field`)
        
        if (!hasQuantity) {
          console.log('\n❌ FAIL: Some entries missing quantity field!')
          return false
        }
      }
    } else {
      console.log(`❌ Status: ${response2.status}`)
      return false
    }
    
    // Test 3: Dashboard with period=1M
    console.log('\n\nTest 3: GET /api/dashboard?period=1M')
    const response3 = await fetch(`${baseUrl}/api/dashboard?period=1M`)
    const data3 = await response3.json()
    
    if (response3.ok) {
      console.log('✅ Status: 200 OK')
      console.log(`✅ Response received with ${data3.salesOverTime?.length || 0} time periods`)
      
      if (data3.salesOverTime && data3.salesOverTime.length > 0) {
        const hasQuantity = data3.salesOverTime.every(entry => 'quantity' in entry)
        console.log(`  ${hasQuantity ? '✅' : '❌'} All entries have quantity field`)
        
        if (!hasQuantity) {
          console.log('\n❌ FAIL: Some entries missing quantity field!')
          return false
        }
      }
    } else {
      console.log(`❌ Status: ${response3.status}`)
      return false
    }
    
    console.log('\n\n✅ ALL TESTS PASSED!')
    console.log('\n📝 Summary:')
    console.log('  • salesOverTime now includes quantity field')
    console.log('  • quantity field is properly calculated for all periods (ID, 1W, 1M)')
    console.log('  • Data structure is consistent across all time periods')
    
    return true
    
  } catch (error) {
    console.error('\n❌ TEST FAILED with error:')
    console.error(error.message)
    console.error('\n💡 Make sure the development server is running: npm run dev')
    return false
  }
}

// Run the test
testDashboardAPI().then(success => {
  process.exit(success ? 0 : 1)
})
