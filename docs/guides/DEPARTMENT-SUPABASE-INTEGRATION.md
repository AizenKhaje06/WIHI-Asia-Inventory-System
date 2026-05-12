# Department Authentication - Supabase Integration

**Status**: ✅ Complete  
**Date**: May 12, 2026  
**Feature**: Department authentication using existing users table

---

## Overview

Integrated department authentication with Supabase using the existing `users` table instead of creating a separate departments table. Department users are stored as operations role users with their assigned channel.

---

## Database Structure

### Using Existing `users` Table

**Columns Used**:
- `username` - Department name (Facebook, TikTok, Lazada, Shopee, Physical Store)
- `password` - Plain text password (to be hashed in production)
- `role` - Set to 'operations' for all departments
- `display_name` - Friendly display name
- `assigned_channel` - Sales channel assignment
- `email` - Optional
- `phone` - Optional
- `created_at` - Timestamp

### Migration File

**File**: `supabase/migrations/039_add_department_users.sql`

**Inserts 5 department users**:
```sql
INSERT INTO users (username, password, role, display_name, assigned_channel) VALUES
  ('Facebook', 'facebook123', 'operations', 'Facebook Department', 'Facebook'),
  ('TikTok', 'tiktok123', 'operations', 'TikTok Department', 'TikTok'),
  ('Lazada', 'lazada123', 'operations', 'Lazada Department', 'Lazada'),
  ('Shopee', 'shopee123', 'operations', 'Shopee Department', 'Shopee'),
  ('Physical Store', 'physical123', 'operations', 'Physical Store Department', 'Physical Store')
```

---

## API Endpoints

### 1. Authenticate Department

**Endpoint**: `POST /api/departments/authenticate`

**Request Body**:
```json
{
  "department": "Facebook",
  "password": "facebook123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "department": {
    "id": "uuid",
    "name": "Facebook",
    "display_name": "Facebook Department",
    "assigned_channel": "Facebook"
  }
}
```

**Error Response** (401):
```json
{
  "error": "Invalid department" | "Invalid password"
}
```

**Implementation**:
- Queries `users` table with `role='operations'`
- Validates password (plain text comparison)
- Returns department info on success

### 2. List Departments

**Endpoint**: `GET /api/departments/list`

**Success Response** (200):
```json
{
  "departments": [
    {
      "id": "uuid",
      "name": "Facebook",
      "display_name": "Facebook Department",
      "assigned_channel": "Facebook",
      "icon_path": "/facebook.png"
    },
    ...
  ]
}
```

**Implementation**:
- Fetches all users with `role='operations'`
- Maps icon paths based on assigned_channel
- Returns sorted list

---

## Frontend Integration

### Login Page (Operations Tab)

**File**: `app/page.tsx`

**Authentication Flow**:
1. User selects "Operations" role tab
2. User selects department from dropdown (Facebook, TikTok, Lazada, Shopee, Physical Store)
3. User enters password
4. On submit, calls `/api/departments/authenticate`
5. If authentication succeeds, redirects to `/dashboard/operations`
6. If authentication fails, shows error message

**Code**:
```typescript
// Operations login - Use department authentication
if (formData.role === 'operations') {
  const authResponse = await fetch('/api/departments/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      department: formData.username,
      password: formData.password
    })
  })

  const authData = await authResponse.json()

  if (!authResponse.ok || !authData.success) {
    throw new Error(authData.error || "Invalid department credentials")
  }

  // Store user session
  localStorage.setItem("isLoggedIn", "true")
  localStorage.setItem("username", authData.department.name)
  localStorage.setItem("userRole", "operations")
  localStorage.setItem("displayName", authData.department.display_name)
  
  router.push('/dashboard/operations')
}
```

### Internal Usage Page

**File**: `app/dashboard/internal-usage/page.tsx`

**Authentication Flow**:
1. User selects department from dropdown
2. User enters password
3. On dispatch, calls `/api/departments/authenticate`
4. If authentication succeeds, proceeds with dispatch
5. If authentication fails, shows error message

**Code**:
```typescript
// Validate department password via API
const authResponse = await fetch('/api/departments/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    department: staffName,
    password: staffPassword
  })
})

const authData = await authResponse.json()

if (!authResponse.ok || !authData.success) {
  alert(authData.error || 'Invalid password for selected department')
  return
}
```

---

## Department Credentials

| Department | Username | Password | Role | Assigned Channel |
|------------|----------|----------|------|------------------|
| Facebook | Facebook | facebook123 | operations | Facebook |
| TikTok | TikTok | tiktok123 | operations | TikTok |
| Lazada | Lazada | lazada123 | operations | Lazada |
| Shopee | Shopee | shopee123 | operations | Shopee |
| Physical Store | Physical Store | physical123 | operations | Physical Store |

---

## How to Run Migration

### Option 1: Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy content from `supabase/migrations/039_add_department_users.sql`
4. Run the SQL

### Option 2: Command Line
```bash
# If using Supabase CLI
supabase db push
```

---

## Security Considerations

### Current Implementation
⚠️ **Passwords are stored in plain text** - NOT SECURE for production!

### Recommended for Production

1. **Hash Passwords**:
```typescript
import bcrypt from 'bcrypt'

// When creating user
const hashedPassword = await bcrypt.hash(password, 10)

// When authenticating
const isValid = await bcrypt.compare(password, user.password)
```

2. **Update Migration**:
```sql
-- Use bcrypt to hash passwords before inserting
INSERT INTO users (username, password, role, display_name, assigned_channel) VALUES
  ('Facebook', '$2b$10$...hashed...', 'operations', 'Facebook Department', 'Facebook')
```

3. **Add Rate Limiting**:
- Limit authentication attempts
- Lock account after failed attempts
- Add CAPTCHA for repeated failures

4. **Add Audit Logging**:
- Log all authentication attempts
- Track successful/failed logins
- Monitor suspicious activity

---

## Testing

### Test Authentication API

```bash
# Test valid credentials
curl -X POST http://localhost:3000/api/departments/authenticate \
  -H "Content-Type: application/json" \
  -d '{"department":"Facebook","password":"facebook123"}'

# Test invalid password
curl -X POST http://localhost:3000/api/departments/authenticate \
  -H "Content-Type: application/json" \
  -d '{"department":"Facebook","password":"wrong"}'

# Test invalid department
curl -X POST http://localhost:3000/api/departments/authenticate \
  -H "Content-Type: application/json" \
  -d '{"department":"Invalid","password":"test"}'
```

### Test List API

```bash
curl http://localhost:3000/api/departments/list
```

---

## Files Modified

1. **Migration**: `supabase/migrations/039_add_department_users.sql`
2. **Auth API**: `app/api/departments/authenticate/route.ts`
3. **List API**: `app/api/departments/list/route.ts`
4. **Login Page**: `app/page.tsx` (Operations login handler)
5. **Login Form**: `components/auth/login-form.tsx` (Department dropdown)
6. **Internal Usage**: `app/dashboard/internal-usage/page.tsx`

---

## Next Steps

1. ✅ Run migration to add department users
2. ✅ Test authentication API
3. ✅ Test internal usage page dispatch
4. 🔲 Implement password hashing (bcrypt)
5. 🔲 Add rate limiting
6. 🔲 Add audit logging
7. 🔲 Update login page to use same authentication

---

## Notes

- Uses existing `users` table structure
- No new tables created
- Department users have `role='operations'`
- Passwords are plain text (temporary)
- Icon paths determined by `assigned_channel`
- Compatible with existing authentication system
