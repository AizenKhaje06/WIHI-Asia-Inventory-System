/**
 * Password Migration Script
 * 
 * This script migrates all plain text passwords in the database to hashed passwords.
 * Run this ONCE after implementing password hashing.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-passwords.ts
 */

import { supabaseAdmin } from '../lib/supabase'
import { hashPassword, isHashed } from '../lib/password-hash'

async function migratePasswords() {
  console.log('🔐 Starting password migration...\n')

  try {
    // Fetch all users
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found in database')
      return
    }

    console.log(`Found ${users.length} users\n`)

    let migratedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // Check if password is already hashed
      if (isHashed(user.password)) {
        console.log(`⏭️  Skipping ${user.username} - already hashed`)
        skippedCount++
        continue
      }

      // Hash the plain text password
      console.log(`🔄 Migrating ${user.username}...`)
      const hashedPassword = await hashPassword(user.password)

      // Update in database
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)

      if (updateError) {
        console.error(`❌ Failed to migrate ${user.username}:`, updateError.message)
        continue
      }

      console.log(`✅ Migrated ${user.username}`)
      migratedCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Migration complete!`)
    console.log(`   Migrated: ${migratedCount}`)
    console.log(`   Skipped: ${skippedCount}`)
    console.log(`   Total: ${users.length}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migratePasswords()
  .then(() => {
    console.log('\n✅ All done! Passwords are now secure.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
