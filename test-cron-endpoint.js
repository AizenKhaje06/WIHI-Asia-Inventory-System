/**
 * Test Cron Endpoint
 * Run: node test-cron-endpoint.js
 */

const VERCEL_URL = process.env.VERCEL_URL || 'https://wihi-asia-inventory-system.vercel.app'

async function testCronEndpoint() {
  console.log('Testing cron endpoint...')
  console.log('URL:', `${VERCEL_URL}/api/cron/send-reports`)
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/cron/send-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('\n=== RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log('Raw Response:', text)
    
    try {
      const data = JSON.parse(text)
      console.log('\n=== PARSED DATA ===')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.currentTime) {
        console.log('\n=== DEBUG INFO ===')
        console.log('Current Time:', data.currentTime)
        console.log('Active Schedules:', data.allActiveSchedules)
        console.log('Matching Schedules:', data.processed)
      }
    } catch (e) {
      console.log('Could not parse as JSON')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testCronEndpoint()
