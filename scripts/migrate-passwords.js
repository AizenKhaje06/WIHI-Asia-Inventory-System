/**
 * Password Migration Script (JavaScript version)
 * 
 * This script migrates all plain text passwords in the database to hashed passwords.
 * Run this ONCE after implementing password hashing.
 * 
 * Usage:
 *   node scripts/migrate-passwords.js
 */

const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Check if a string is already hashed (bcrypt format)
 */
function isHashed(str) {
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str);
}

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function migratePasswords() {
  console.log('🔐 Starting password migration...\n');

  try {
    // Fetch all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found in database');
      return;
    }

    console.log(`Found ${users.length} users\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if password is already hashed
      if (isHashed(user.password)) {
        console.log(`⏭️  Skipping ${user.username} - already hashed`);
        skippedCount++;
        continue;
      }

      // Hash the plain text password
      console.log(`🔄 Migrating ${user.username}...`);
      const hashedPassword = await hashPassword(user.password);

      // Update in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Failed to migrate ${user.username}:`, updateError.message);
        continue;
      }

      console.log(`✅ Migrated ${user.username}`);
      migratedCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration complete!`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${users.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migratePasswords()
  .then(() => {
    console.log('\n✅ All done! Passwords are now secure.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
