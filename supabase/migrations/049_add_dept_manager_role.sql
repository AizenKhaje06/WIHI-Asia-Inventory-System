-- Migration 049: Add dept-manager role and agent tracking
-- Adds support for department manager accounts and per-agent order tracking

-- 1. Update users table role constraint to allow 'dept-manager'
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'operations', 'packer', 'tracker', 'logistics-admin', 'dept-manager'));

-- 2. Add agent_username column to orders for reliable agent tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS agent_username TEXT;

-- 3. Backfill agent_username from dispatched_by where possible
-- (dispatched_by stores display name, agent_username will store the actual username)
-- This will be populated going forward when orders are dispatched

-- 4. Create index for fast agent filtering
CREATE INDEX IF NOT EXISTS idx_orders_agent_username ON orders(agent_username);
CREATE INDEX IF NOT EXISTS idx_orders_sales_channel ON orders(sales_channel);

-- 5. Add comment for documentation
COMMENT ON COLUMN orders.agent_username IS 'Username of the agent who dispatched this order (for dept-manager filtering)';
