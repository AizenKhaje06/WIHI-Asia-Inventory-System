// Generate hashed password for Logistics Admin account
// Run this with: node generate-logistics-password.js

const bcrypt = require('bcrypt');

async function generateHash() {
  // Change this password to whatever you want
  const password = 'LogisticsAdmin123';
  
  console.log('\n=== Generating Logistics Admin Password Hash ===\n');
  console.log('Password:', password);
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Hashed Password:', hash);
  console.log('\n=== COMPLETE SQL Statement (with UUID) ===\n');
  console.log(`-- STEP 1: Drop the old role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- STEP 2: Add new constraint that includes 'logistics-admin'
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'packer', 'tracker', 'operations', 'logistics-admin'));

-- STEP 3: Insert the logistics-admin account
INSERT INTO users (id, username, password, role, display_name, email, created_at)
VALUES (
  gen_random_uuid(),
  'logistics-admin',
  '${hash}',
  'logistics-admin',
  'Logistics Admin',
  'logistics@example.com',
  NOW()
);

-- STEP 4: Verify
SELECT username, role, display_name, created_at FROM users WHERE role = 'logistics-admin';`);
  console.log('\n=== Copy the SQL above and run it in Supabase SQL Editor ===\n');
}

generateHash().catch(console.error);
