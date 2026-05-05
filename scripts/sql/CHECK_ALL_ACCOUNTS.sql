-- ============================================
-- CHECK ALL ACCOUNTS IN SUPABASE
-- ============================================

-- 1. Check Users Table Structure
SELECT 
    'Users Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check All User Accounts
SELECT 
    'All User Accounts' as check_type,
    id,
    username,
    display_name,
    role,
    assigned_channel,
    email,
    phone,
    created_at,
    CASE 
        WHEN password IS NOT NULL AND password != '' THEN 'Has Password'
        ELSE 'No Password'
    END as password_status
FROM users
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'team_leader' THEN 2
        WHEN 'operations' THEN 3
        ELSE 4
    END,
    assigned_channel;

-- 3. Count Users by Role
SELECT 
    'User Count by Role' as check_type,
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- 4. Count Team Leaders by Channel
SELECT 
    'Team Leaders by Channel' as check_type,
    assigned_channel,
    COUNT(*) as count
FROM users
WHERE role = 'team_leader'
GROUP BY assigned_channel
ORDER BY assigned_channel;

-- 5. Check for Missing Required Fields
SELECT 
    'Users with Missing Fields' as check_type,
    username,
    display_name,
    role,
    assigned_channel,
    CASE WHEN password IS NULL OR password = '' THEN 'Missing Password' ELSE 'OK' END as password_check,
    CASE WHEN email IS NULL OR email = '' THEN 'Missing Email' ELSE 'OK' END as email_check,
    CASE WHEN display_name IS NULL OR display_name = '' THEN 'Missing Display Name' ELSE 'OK' END as display_name_check
FROM users
WHERE 
    password IS NULL OR password = '' OR
    display_name IS NULL OR display_name = '' OR
    (role = 'team_leader' AND (assigned_channel IS NULL OR assigned_channel = ''));

-- 6. Check Role Constraint
SELECT 
    'Role Constraint Check' as check_type,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname LIKE '%role%';

-- 7. Check Team Leader Accounts Details
SELECT 
    'Team Leader Accounts Detail' as check_type,
    username,
    display_name,
    assigned_channel,
    email,
    phone,
    created_at,
    LENGTH(password) as password_length,
    CASE 
        WHEN password LIKE '$2%' THEN 'Bcrypt Hashed'
        ELSE 'Plain Text or Other'
    END as password_type
FROM users
WHERE role = 'team_leader'
ORDER BY assigned_channel;

-- 8. Check Admin Accounts
SELECT 
    'Admin Accounts Detail' as check_type,
    username,
    display_name,
    email,
    phone,
    created_at,
    LENGTH(password) as password_length,
    CASE 
        WHEN password LIKE '$2%' THEN 'Bcrypt Hashed'
        ELSE 'Plain Text or Other'
    END as password_type
FROM users
WHERE role = 'admin'
ORDER BY username;

-- 9. Check Operations Accounts
SELECT 
    'Operations Accounts Detail' as check_type,
    username,
    display_name,
    email,
    phone,
    created_at,
    LENGTH(password) as password_length,
    CASE 
        WHEN password LIKE '$2%' THEN 'Bcrypt Hashed'
        ELSE 'Plain Text or Other'
    END as password_type
FROM users
WHERE role = 'operations'
ORDER BY username;

-- 10. Check for Duplicate Usernames
SELECT 
    'Duplicate Usernames Check' as check_type,
    username,
    COUNT(*) as count
FROM users
GROUP BY username
HAVING COUNT(*) > 1;

-- 11. Check for Duplicate Channels (Team Leaders)
SELECT 
    'Duplicate Channels Check' as check_type,
    assigned_channel,
    COUNT(*) as count
FROM users
WHERE role = 'team_leader'
GROUP BY assigned_channel
HAVING COUNT(*) > 1;

-- 12. Verify All Expected Channels Have Team Leaders
SELECT 
    'Expected Channels Coverage' as check_type,
    channel,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users 
            WHERE role = 'team_leader' 
            AND assigned_channel = channel
        ) THEN 'Has Team Leader'
        ELSE 'Missing Team Leader'
    END as status
FROM (
    VALUES 
        ('Shopee'),
        ('Lazada'),
        ('Facebook'),
        ('TikTok'),
        ('Physical Store')
) AS expected_channels(channel);

-- 13. Summary Report
SELECT 
    'Summary Report' as check_type,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
    (SELECT COUNT(*) FROM users WHERE role = 'team_leader') as team_leader_count,
    (SELECT COUNT(*) FROM users WHERE role = 'operations') as operations_count,
    (SELECT COUNT(*) FROM users WHERE password IS NULL OR password = '') as users_without_password,
    (SELECT COUNT(*) FROM users WHERE email IS NULL OR email = '') as users_without_email;
