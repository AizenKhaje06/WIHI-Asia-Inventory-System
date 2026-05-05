-- Create Packer Account
-- Username: packer1
-- Password: pack789 (default password)

INSERT INTO users (id, username, password, role, display_name, email)
VALUES (
  gen_random_uuid(),
  'packer1',
  'pack789',
  'packer',
  'Packer 1',
  'packer1@example.com'
)
ON CONFLICT (username) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;

-- Verify the account was created
SELECT id, username, role, display_name, email, created_at
FROM users
WHERE username = 'packer1';
