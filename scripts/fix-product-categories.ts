/**
 * Script to fix product categories to match Supabase categories table
 * 
 * Current categories in database:
 * - Beauty Soap
 * - Fashion & Apparel
 * 
 * This script will update all products to use only these 2 categories
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function fixCategories() {
  console.log('🔧 Starting category fix...')
  
  // Fetch all products
  const itemsResponse = await fetch('http://localhost:3001/api/items')
  const items = await itemsResponse.json()
  
  console.log(`📦 Found ${items.length} products`)
  
  // Category mapping based on product names
  const categoryMapping: { [key: string]: string } = {
    'BERRY SOAP': 'Beauty Soap',
    'NIACINAMIDE SOAP': 'Beauty Soap',
    'BUILD CORD': 'Fashion & Apparel',
    'DREAM BEATS': 'Fashion & Apparel',
    'FURGLOW': 'Beauty Soap'
  }
  
  // Update each product
  for (const item of items) {
    const newCategory = categoryMapping[item.name] || 'Fashion & Apparel'
    
    if (item.category !== newCategory) {
      console.log(`📝 Updating ${item.name}: "${item.category}" → "${newCategory}"`)
      
      const response = await fetch(`http://localhost:3001/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      })
      
      if (response.ok) {
        console.log(`✅ Updated ${item.name}`)
      } else {
        console.error(`❌ Failed to update ${item.name}`)
      }
    } else {
      console.log(`⏭️  ${item.name} already has correct category`)
    }
  }
  
  console.log('✨ Category fix complete!')
}

fixCategories().catch(console.error)
