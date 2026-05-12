/**
 * Test Department Filtering
 * 
 * This script tests if department filtering is working correctly
 * by simulating API requests with different user roles and departments.
 */

const BASE_URL = 'http://localhost:3000'

// Test users
const USERS = {
  carlo: {
    username: 'Lazada-Carlo',
    role: 'operations',
    displayName: 'Carlo',
    assignedChannel: 'Lazada'
  },
  juan: {
    username: 'Facebook-Juan',
    role: 'operations',
    displayName: 'Juan',
    assignedChannel: 'Facebook'
  },
  admin: {
    username: 'admin',
    role: 'admin',
    displayName: 'Administrator',
    assignedChannel: null
  }
}

// Helper to make authenticated API request
async function apiRequest(endpoint, user) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-username': user.username,
    'x-user-role': user.role,
    'x-user-display-name': user.displayName
  }

  if (user.assignedChannel) {
    headers['x-assigned-channel'] = user.assignedChannel
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers })
  return response.json()
}

// Test functions
async function testOrders(user) {
  console.log(`\n📦 Testing Orders API as ${user.displayName} (${user.assignedChannel || 'All'})...`)
  const orders = await apiRequest('/api/orders?status=Packed', user)
  
  if (!Array.isArray(orders)) {
    console.log('❌ Error:', orders.error || 'Invalid response')
    return
  }

  console.log(`   Total orders: ${orders.length}`)
  
  if (user.assignedChannel) {
    const wrongChannel = orders.filter(o => o.sales_channel !== user.assignedChannel)
    if (wrongChannel.length > 0) {
      console.log(`   ❌ FAIL: Found ${wrongChannel.length} orders from other departments!`)
      console.log(`   Wrong channels:`, [...new Set(wrongChannel.map(o => o.sales_channel))])
    } else {
      console.log(`   ✅ PASS: All orders are from ${user.assignedChannel}`)
    }
  } else {
    const channels = [...new Set(orders.map(o => o.sales_channel))]
    console.log(`   ✅ PASS: Admin sees all channels:`, channels)
  }
}

async function testItems(user) {
  console.log(`\n📋 Testing Items API as ${user.displayName} (${user.assignedChannel || 'All'})...`)
  const items = await apiRequest('/api/items', user)
  
  if (!Array.isArray(items)) {
    console.log('❌ Error:', items.error || 'Invalid response')
    return
  }

  console.log(`   Total items: ${items.length}`)
  
  if (user.assignedChannel) {
    const wrongChannel = items.filter(i => i.salesChannel !== user.assignedChannel)
    if (wrongChannel.length > 0) {
      console.log(`   ❌ FAIL: Found ${wrongChannel.length} items from other departments!`)
      console.log(`   Wrong channels:`, [...new Set(wrongChannel.map(i => i.salesChannel))])
    } else {
      console.log(`   ✅ PASS: All items are from ${user.assignedChannel}`)
    }
  } else {
    const channels = [...new Set(items.map(i => i.salesChannel))]
    console.log(`   ✅ PASS: Admin sees all channels:`, channels)
  }
}

async function testLogs(user) {
  console.log(`\n📝 Testing Logs API as ${user.displayName} (${user.assignedChannel || 'All'})...`)
  const logs = await apiRequest('/api/logs', user)
  
  if (!Array.isArray(logs)) {
    console.log('❌ Error:', logs.error || 'Invalid response')
    return
  }

  console.log(`   Total logs: ${logs.length}`)
  console.log(`   ✅ Logs API responded successfully`)
}

async function testStores(user) {
  console.log(`\n🏪 Testing Stores API as ${user.displayName} (${user.assignedChannel || 'All'})...`)
  const stores = await apiRequest('/api/stores', user)
  
  if (!Array.isArray(stores)) {
    console.log('❌ Error:', stores.error || 'Invalid response')
    return
  }

  console.log(`   Total stores: ${stores.length}`)
  
  if (user.assignedChannel) {
    const wrongChannel = stores.filter(s => s.salesChannel !== user.assignedChannel)
    if (wrongChannel.length > 0) {
      console.log(`   ❌ FAIL: Found ${wrongChannel.length} stores from other departments!`)
    } else {
      console.log(`   ✅ PASS: All stores are from ${user.assignedChannel}`)
    }
  } else {
    const channels = [...new Set(stores.map(s => s.salesChannel))]
    console.log(`   ✅ PASS: Admin sees all channels:`, channels)
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 DEPARTMENT FILTERING TEST SUITE')
  console.log('=' .repeat(50))

  try {
    // Test Carlo (Lazada)
    console.log('\n\n👤 Testing as CARLO (Lazada Operations)')
    console.log('-'.repeat(50))
    await testOrders(USERS.carlo)
    await testItems(USERS.carlo)
    await testLogs(USERS.carlo)
    await testStores(USERS.carlo)

    // Test Juan (Facebook)
    console.log('\n\n👤 Testing as JUAN (Facebook Operations)')
    console.log('-'.repeat(50))
    await testOrders(USERS.juan)
    await testItems(USERS.juan)
    await testLogs(USERS.juan)
    await testStores(USERS.juan)

    // Test Admin
    console.log('\n\n👤 Testing as ADMIN (All Departments)')
    console.log('-'.repeat(50))
    await testOrders(USERS.admin)
    await testItems(USERS.admin)
    await testLogs(USERS.admin)
    await testStores(USERS.admin)

    console.log('\n\n✅ ALL TESTS COMPLETED')
    console.log('=' .repeat(50))
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
  }
}

// Run tests
runTests()
