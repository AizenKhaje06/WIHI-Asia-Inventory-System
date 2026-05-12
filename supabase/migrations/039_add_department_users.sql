-- Add department users to existing users table
-- These users will have role='operations' and assigned_channel set to their department

-- Insert department users (if they don't exist)
INSERT INTO users (id, username, password, role, display_name, assigned_channel) VALUES
  ('dept_facebook_' || extract(epoch from now())::text, 'Facebook', 'facebook123', 'operations', 'Facebook Department', 'Facebook'),
  ('dept_tiktok_' || extract(epoch from now())::text, 'TikTok', 'tiktok123', 'operations', 'TikTok Department', 'TikTok'),
  ('dept_lazada_' || extract(epoch from now())::text, 'Lazada', 'lazada123', 'operations', 'Lazada Department', 'Lazada'),
  ('dept_shopee_' || extract(epoch from now())::text, 'Shopee', 'shopee123', 'operations', 'Shopee Department', 'Shopee'),
  ('dept_physical_' || extract(epoch from now())::text, 'Physical Store', 'physical123', 'operations', 'Physical Store Department', 'Physical Store')
ON CONFLICT (username) DO UPDATE SET
  assigned_channel = EXCLUDED.assigned_channel,
  display_name = EXCLUDED.display_name;

-- Add comment
COMMENT ON COLUMN users.assigned_channel IS 'Sales channel/department assigned to operations users';
