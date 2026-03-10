-- Migration: Add team leader fields to users table
-- Purpose: Support team leader role with channel assignment

-- Add assigned_channel column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_channel VARCHAR(50);

-- Add role column if it doesn't exist (default to 'operations' for backward compatibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'operations';

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_users_assigned_channel ON users(assigned_channel);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_channel_role ON users(assigned_channel, role);

-- Add comment for documentation
COMMENT ON COLUMN users.assigned_channel IS 'Sales channel assigned to team leader (Warehouse Admin, TikTok, Shopee, Facebook, Lazada)';
COMMENT ON COLUMN users.role IS 'User role: admin, operations, team_leader';
