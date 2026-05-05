// Script to hash packer password
// Run with: node hash-packer-password.js

const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'pack789';
  const saltRounds = 10;
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('\n=== PACKER PASSWORD HASH ===\n');
  console.log('Plain password:', password);
  console.log('Hashed password:', hashedPassword);
  console.log('\n=== SQL TO UPDATE ===\n');
  console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'packer1';`);
  console.log('\n');
}

hashPassword().catch(console.error);
