/**
 * Test All Accounts Connection to Supabase
 * This script tests authentication for all account types
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testSupabaseConnection() {
  log('\n🔌 Testing Supabase Connection...', 'cyan')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      log(`❌ Connection failed: ${error.message}`, 'red')
      return false
    }
    
    log('✅ Supabase connection successful', 'green')
    return true
  } catch (error) {
    log(`❌ Connection error: ${error.message}`, 'red')
    return false
  }
}

async function getAllAccounts() {
  log('\n📋 Fetching all accounts from database...', 'cyan')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, role, assigned_channel, email, phone, password')
      .order('role', { ascending: true })
      .order('assigned_channel', { ascending: true })
    
    if (error) {
      log(`❌ Failed to fetch accounts: ${error.message}`, 'red')
      return null
    }
    
    log(`✅ Found ${data.length} accounts`, 'green')
    return data
  } catch (error) {
    log(`❌ Error fetching accounts: ${error.message}`, 'red')
    return null
  }
}

async function testAccountStructure(accounts) {
  log('\n🔍 Checking Account Structure...', 'cyan')
  
  let issues = []
  
  accounts.forEach(account => {
    const problems = []
    
    if (!account.username) problems.push('Missing username')
    if (!account.display_name) problems.push('Missing display_name')
    if (!account.role) problems.push('Missing role')
    if (!account.password || account.password === '') problems.push('Missing password')
    
    if (account.role === 'team_leader') {
      if (!account.assigned_channel) problems.push('Missing assigned_channel')
    }
    
    if (problems.length > 0) {
      issues.push({
        username: account.username || 'UNKNOWN',
        role: account.role || 'UNKNOWN',
        problems
      })
    }
  })
  
  if (issues.length > 0) {
    log(`⚠️  Found ${issues.length} accounts with issues:`, 'yellow')
    issues.forEach(issue => {
      log(`   - ${issue.username} (${issue.role}): ${issue.problems.join(', ')}`, 'yellow')
    })
  } else {
    log('✅ All accounts have required fields', 'green')
  }
  
  return issues.length === 0
}

async function testAccountsByRole(accounts) {
  log('\n📊 Accounts by Role:', 'cyan')
  
  const roleCount = {}
  accounts.forEach(account => {
    roleCount[account.role] = (roleCount[account.role] || 0) + 1
  })
  
  Object.entries(roleCount).forEach(([role, count]) => {
    log(`   ${role}: ${count}`, 'blue')
  })
  
  return roleCount
}

async function testTeamLeaderChannels(accounts) {
  log('\n🏪 Team Leader Channel Coverage:', 'cyan')
  
  const expectedChannels = ['Shopee', 'Lazada', 'Facebook', 'TikTok', 'Physical Store']
  const teamLeaders = accounts.filter(a => a.role === 'team_leader')
  
  const channelMap = {}
  teamLeaders.forEach(tl => {
    if (tl.assigned_channel) {
      channelMap[tl.assigned_channel] = tl
    }
  })
  
  let allCovered = true
  expectedChannels.forEach(channel => {
    if (channelMap[channel]) {
      log(`   ✅ ${channel}: ${channelMap[channel].username} (${channelMap[channel].display_name})`, 'green')
    } else {
      log(`   ❌ ${channel}: NO TEAM LEADER`, 'red')
      allCovered = false
    }
  })
  
  // Check for unexpected channels
  Object.keys(channelMap).forEach(channel => {
    if (!expectedChannels.includes(channel)) {
      log(`   ⚠️  Unexpected channel: ${channel}`, 'yellow')
    }
  })
  
  return allCovered
}

async function testPasswordTypes(accounts) {
  log('\n🔐 Password Types:', 'cyan')
  
  let bcryptCount = 0
  let plainTextCount = 0
  let missingCount = 0
  
  accounts.forEach(account => {
    if (!account.password || account.password === '') {
      missingCount++
    } else if (account.password.startsWith('$2')) {
      bcryptCount++
    } else {
      plainTextCount++
    }
  })
  
  log(`   Bcrypt hashed: ${bcryptCount}`, bcryptCount > 0 ? 'green' : 'yellow')
  log(`   Plain text: ${plainTextCount}`, plainTextCount > 0 ? 'yellow' : 'green')
  log(`   Missing: ${missingCount}`, missingCount > 0 ? 'red' : 'green')
  
  if (plainTextCount > 0) {
    log('   ⚠️  Warning: Some passwords are not hashed!', 'yellow')
  }
  
  return missingCount === 0
}

async function testDuplicates(accounts) {
  log('\n🔍 Checking for Duplicates...', 'cyan')
  
  // Check duplicate usernames
  const usernameMap = {}
  accounts.forEach(account => {
    usernameMap[account.username] = (usernameMap[account.username] || 0) + 1
  })
  
  const duplicateUsernames = Object.entries(usernameMap).filter(([_, count]) => count > 1)
  
  if (duplicateUsernames.length > 0) {
    log('   ❌ Duplicate usernames found:', 'red')
    duplicateUsernames.forEach(([username, count]) => {
      log(`      - ${username}: ${count} times`, 'red')
    })
  } else {
    log('   ✅ No duplicate usernames', 'green')
  }
  
  // Check duplicate channels for team leaders
  const teamLeaders = accounts.filter(a => a.role === 'team_leader')
  const channelMap = {}
  teamLeaders.forEach(tl => {
    if (tl.assigned_channel) {
      channelMap[tl.assigned_channel] = (channelMap[tl.assigned_channel] || 0) + 1
    }
  })
  
  const duplicateChannels = Object.entries(channelMap).filter(([_, count]) => count > 1)
  
  if (duplicateChannels.length > 0) {
    log('   ❌ Duplicate team leader channels found:', 'red')
    duplicateChannels.forEach(([channel, count]) => {
      log(`      - ${channel}: ${count} team leaders`, 'red')
    })
  } else {
    log('   ✅ No duplicate team leader channels', 'green')
  }
  
  return duplicateUsernames.length === 0 && duplicateChannels.length === 0
}

async function displayAccountDetails(accounts) {
  log('\n📝 Account Details:', 'cyan')
  
  // Group by role
  const byRole = {
    admin: [],
    team_leader: [],
    operations: [],
    other: []
  }
  
  accounts.forEach(account => {
    const role = account.role || 'other'
    if (byRole[role]) {
      byRole[role].push(account)
    } else {
      byRole.other.push(account)
    }
  })
  
  // Display admins
  if (byRole.admin.length > 0) {
    log('\n   👑 ADMIN ACCOUNTS:', 'magenta')
    byRole.admin.forEach(account => {
      log(`      - ${account.username} (${account.display_name})`, 'blue')
      log(`        Email: ${account.email || 'Not set'}`, 'blue')
      log(`        Password: ${account.password ? '✅ Set' : '❌ Missing'}`, account.password ? 'green' : 'red')
    })
  }
  
  // Display team leaders
  if (byRole.team_leader.length > 0) {
    log('\n   👥 TEAM LEADER ACCOUNTS:', 'magenta')
    byRole.team_leader.forEach(account => {
      log(`      - ${account.username} (${account.display_name})`, 'blue')
      log(`        Channel: ${account.assigned_channel || 'Not assigned'}`, account.assigned_channel ? 'blue' : 'red')
      log(`        Email: ${account.email || 'Not set'}`, 'blue')
      log(`        Password: ${account.password ? '✅ Set' : '❌ Missing'}`, account.password ? 'green' : 'red')
    })
  }
  
  // Display operations
  if (byRole.operations.length > 0) {
    log('\n   🔧 OPERATIONS ACCOUNTS:', 'magenta')
    byRole.operations.forEach(account => {
      log(`      - ${account.username} (${account.display_name})`, 'blue')
      log(`        Email: ${account.email || 'Not set'}`, 'blue')
      log(`        Password: ${account.password ? '✅ Set' : '❌ Missing'}`, account.password ? 'green' : 'red')
    })
  }
  
  // Display others
  if (byRole.other.length > 0) {
    log('\n   ❓ OTHER ACCOUNTS:', 'magenta')
    byRole.other.forEach(account => {
      log(`      - ${account.username} (${account.display_name}) - Role: ${account.role}`, 'yellow')
    })
  }
}

async function runTests() {
  log('═══════════════════════════════════════════════════', 'cyan')
  log('   SUPABASE ACCOUNT CONNECTION TEST', 'cyan')
  log('═══════════════════════════════════════════════════', 'cyan')
  
  // Test 1: Connection
  const connected = await testSupabaseConnection()
  if (!connected) {
    log('\n❌ Cannot proceed without database connection', 'red')
    process.exit(1)
  }
  
  // Test 2: Fetch accounts
  const accounts = await getAllAccounts()
  if (!accounts || accounts.length === 0) {
    log('\n❌ No accounts found in database', 'red')
    process.exit(1)
  }
  
  // Test 3: Account structure
  const structureOk = await testAccountStructure(accounts)
  
  // Test 4: Accounts by role
  await testAccountsByRole(accounts)
  
  // Test 5: Team leader channels
  const channelsOk = await testTeamLeaderChannels(accounts)
  
  // Test 6: Password types
  const passwordsOk = await testPasswordTypes(accounts)
  
  // Test 7: Duplicates
  const noDuplicates = await testDuplicates(accounts)
  
  // Test 8: Display details
  await displayAccountDetails(accounts)
  
  // Summary
  log('\n═══════════════════════════════════════════════════', 'cyan')
  log('   TEST SUMMARY', 'cyan')
  log('═══════════════════════════════════════════════════', 'cyan')
  
  const allPassed = structureOk && channelsOk && passwordsOk && noDuplicates
  
  log(`\n   Database Connection: ✅`, 'green')
  log(`   Account Structure: ${structureOk ? '✅' : '❌'}`, structureOk ? 'green' : 'red')
  log(`   Channel Coverage: ${channelsOk ? '✅' : '❌'}`, channelsOk ? 'green' : 'red')
  log(`   Passwords Set: ${passwordsOk ? '✅' : '❌'}`, passwordsOk ? 'green' : 'red')
  log(`   No Duplicates: ${noDuplicates ? '✅' : '❌'}`, noDuplicates ? 'green' : 'red')
  
  if (allPassed) {
    log('\n🎉 All tests passed! Your accounts are properly configured.', 'green')
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow')
  }
  
  log('\n═══════════════════════════════════════════════════\n', 'cyan')
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
