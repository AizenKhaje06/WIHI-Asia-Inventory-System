-- Check current assigned_channel values for all operations users
SELECT 
  username, 
  display_name, 
  role, 
  assigned_channel,
  CASE 
    WHEN assigned_channel IS NULL THEN '❌ NULL - NEEDS FIX'
    ELSE '✅ OK'
  END as status
FROM users 
WHERE role = 'operations'
ORDER BY username;

-- Fix: Update assigned_channel for all agents based on their username pattern
-- Format: "Department-AgentName" → assigned_channel = "Department"

UPDATE users
SET assigned_channel = CASE
  WHEN username LIKE 'Facebook%' THEN 'Facebook'
  WHEN username LIKE 'TikTok%' THEN 'TikTok'
  WHEN username LIKE 'Lazada%' THEN 'Lazada'
  WHEN username LIKE 'Shopee%' THEN 'Shopee'
  WHEN username LIKE 'Physical Store%' THEN 'Physical Store'
  ELSE assigned_channel
END
WHERE role = 'operations' AND assigned_channel IS NULL;

-- Verify the fix
SELECT 
  username, 
  display_name, 
  role, 
  assigned_channel,
  CASE 
    WHEN assigned_channel IS NULL THEN '❌ STILL NULL'
    ELSE '✅ FIXED'
  END as status
FROM users 
WHERE role = 'operations'
ORDER BY username;
