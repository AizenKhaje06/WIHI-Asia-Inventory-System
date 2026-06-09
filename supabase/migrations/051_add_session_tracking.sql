-- Add session tracking to users table
-- This enables single-device login security

-- Add session columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_session_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;

-- Add comments
COMMENT ON COLUMN users.active_session_id IS 'Current active session ID - only one session allowed per user';
COMMENT ON COLUMN users.session_created_at IS 'When the current session was created';
COMMENT ON COLUMN users.last_activity IS 'Last time the user was active in this session';
