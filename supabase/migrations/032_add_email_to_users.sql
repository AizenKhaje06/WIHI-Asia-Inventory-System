-- Add email and phone columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add unique constraint on email (optional, but recommended)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.email IS 'User email address for password reset and notifications';
COMMENT ON COLUMN users.phone IS 'User phone number for contact purposes';
