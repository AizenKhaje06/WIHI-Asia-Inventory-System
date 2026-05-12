// Test Department Authentication
// Run this to verify department users exist and test authentication

const testDepartmentAuth = async () => {
  console.log('🧪 Testing Department Authentication\n')

  // Test 1: Check if departments endpoint works
  console.log('1️⃣ Testing GET /api/departments/list')
  try {
    const listResponse = await fetch('http://localhost:3000/api/departments/list')
    const listData = await listResponse.json()
    console.log('✅ Departments list:', JSON.stringify(listData, null, 2))
  } catch (error) {
    console.error('❌ Failed to fetch departments:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Test 2: Test authentication with correct credentials
  console.log('2️⃣ Testing POST /api/departments/authenticate (correct password)')
  try {
    const authResponse = await fetch('http://localhost:3000/api/departments/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'Facebook',
        password: 'facebook123'
      })
    })
    const authData = await authResponse.json()
    console.log('Status:', authResponse.status)
    console.log('Response:', JSON.stringify(authData, null, 2))
    
    if (authResponse.ok) {
      console.log('✅ Authentication successful!')
    } else {
      console.log('❌ Authentication failed!')
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Test 3: Test authentication with wrong password
  console.log('3️⃣ Testing POST /api/departments/authenticate (wrong password)')
  try {
    const authResponse = await fetch('http://localhost:3000/api/departments/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'Facebook',
        password: 'wrongpassword'
      })
    })
    const authData = await authResponse.json()
    console.log('Status:', authResponse.status)
    console.log('Response:', JSON.stringify(authData, null, 2))
    
    if (!authResponse.ok) {
      console.log('✅ Correctly rejected wrong password')
    } else {
      console.log('❌ Should have rejected wrong password!')
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Test 4: Test all departments
  console.log('4️⃣ Testing all departments')
  const departments = [
    { name: 'Facebook', password: 'facebook123' },
    { name: 'TikTok', password: 'tiktok123' },
    { name: 'Lazada', password: 'lazada123' },
    { name: 'Shopee', password: 'shopee123' },
    { name: 'Physical Store', password: 'physical123' }
  ]

  for (const dept of departments) {
    try {
      const authResponse = await fetch('http://localhost:3000/api/departments/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: dept.name,
          password: dept.password
        })
      })
      const authData = await authResponse.json()
      
      if (authResponse.ok) {
        console.log(`✅ ${dept.name}: Authentication successful`)
      } else {
        console.log(`❌ ${dept.name}: ${authData.error}`)
      }
    } catch (error) {
      console.log(`❌ ${dept.name}: Request failed - ${error.message}`)
    }
  }

  console.log('\n✨ Test complete!')
}

// Run the test
testDepartmentAuth()
