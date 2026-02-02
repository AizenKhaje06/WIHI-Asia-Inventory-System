/**
 * Migration Runner
 * Loads environment variables and runs the TypeScript migration script
 */

require('dotenv').config({ path: '.env.local' })

// Verify environment variables are loaded
console.log('🔍 Checking environment variables...')
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('   GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing')
console.log('')

// Run the migration
require('child_process').execSync('npx tsx scripts/migrate-to-supabase.ts', {
  stdio: 'inherit',
  env: process.env
})
