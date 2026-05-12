# Internal Usage Agent Authentication System

**Status**: ✅ Complete  
**Date**: May 12, 2026  
**Feature**: Agent Dropdown with Password Authentication

---

## Overview

Modified both the **Operations Login Page** and **Internal Usage page** (Adjustment Log in Operations tab) to use dropdown selection for agents instead of manual username input.

---

## Changes Made

### 1. Operations Login Page (`components/auth/login-form.tsx`)

**Changed Username Field**:
- **For Operations role**: Shows dropdown with agent selection
- **For Admin/Packer roles**: Shows traditional username input field

**Agent Dropdown Options**:
- 📘 Facebook Agent
- 🎵 TikTok Agent
- 🛒 Lazada Agent
- 🛍️ Shopee Agent
- 🏪 Physical Store Agent

**Implementation**:
```tsx
{role === 'operations' ? (
  <Select value={username} onValueChange={setUsername}>
    <SelectTrigger>
      <SelectValue placeholder="Select agent" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Facebook">📘 Facebook Agent</SelectItem>
      <SelectItem value="TikTok">🎵 TikTok Agent</SelectItem>
      <SelectItem value="Lazada">🛒 Lazada Agent</SelectItem>
      <SelectItem value="Shopee">🛍️ Shopee Agent</SelectItem>
      <SelectItem value="Physical Store">🏪 Physical Store Agent</SelectItem>
    </SelectContent>
  </Select>
) : (
  <Input placeholder="Enter your username" ... />
)}
```

### 2. Internal Usage Page (`app/dashboard/internal-usage/page.tsx`)

**Added Password State**:
```typescript
const [staffName, setStaffName] = useState('')
const [staffPassword, setStaffPassword] = useState('')
```

**Removed Auto-Login Detection**:
- Removed automatic user detection
- Staff must manually select their agent role

**Agent Dropdown**:
- Same 5 agents as login page
- Password field appears after agent selection

**Password Authentication**:
```typescript
const agentPasswords: Record<string, string> = {
  'Facebook': 'facebook123',
  'TikTok': 'tiktok123',
  'Lazada': 'lazada123',
  'Shopee': 'shopee123',
  'Physical Store': 'physical123'
}
```

---

## User Flow

### Operations Login
1. Navigate to login page
2. Click "Operations" tab
3. **Select agent from dropdown** (not manual input)
4. Enter password
5. Click "Sign In"

### Internal Usage Dispatch
1. Click "Dispatch Items" button
2. Add items to cart
3. Select purpose
4. Select sales channel (if applicable)
5. **Select agent from dropdown**
6. **Enter agent password**
7. Click "Dispatch Items"
8. System validates password
9. If valid, dispatch succeeds

---

## Agent Credentials (For Testing)

| Agent | Password |
|-------|----------|
| Facebook | facebook123 |
| TikTok | tiktok123 |
| Lazada | lazada123 |
| Shopee | shopee123 |
| Physical Store | physical123 |

**⚠️ WARNING**: These are test passwords. Change them before production deployment!

---

## UI/UX Design

### Login Page
- **Label**: Changes from "Username" to "Agent" for Operations role
- **Dropdown**: Professional select component with icons
- **Styling**: Matches existing login form design
- **Icon**: User icon positioned on the left

### Internal Usage Page
- **Agent Selection**: Dropdown with emoji icons
- **Password Field**: Appears after agent selection
- **Validation**: Real-time password validation
- **Reset**: Password clears when agent changes

---

## Testing Checklist

**Login Page**:
- [x] Operations role shows dropdown (not input)
- [x] Admin role shows input field
- [x] Packer role shows input field
- [x] Dropdown displays all 5 agents
- [x] Agent selection works correctly
- [x] Login succeeds with correct credentials

**Internal Usage Page**:
- [x] Agent dropdown displays all 5 options
- [x] Password field appears after agent selection
- [x] Password field is hidden (type="password")
- [x] Password resets when agent changes
- [x] Correct password allows dispatch
- [x] Incorrect password shows error
- [x] Empty password shows error
- [x] Agent name and password reset after successful dispatch

**No TypeScript Errors**:
- [x] components/auth/login-form.tsx
- [x] app/dashboard/internal-usage/page.tsx

---

## Security Notes

### Current Implementation
- Passwords are **hardcoded** in the frontend
- This is **NOT secure** for production use
- Passwords are visible in the source code

### Recommended Improvements
1. **Backend Validation**: Move password validation to API
2. **Database Storage**: Store agent credentials in database (hashed)
3. **JWT Tokens**: Issue tokens after successful authentication
4. **Session Management**: Track authenticated sessions
5. **Password Hashing**: Use bcrypt or similar for password storage
6. **Rate Limiting**: Prevent brute force attacks
7. **Audit Logging**: Log all authentication attempts

---

## Related Files

- `components/auth/login-form.tsx` - Login page with agent dropdown
- `app/dashboard/internal-usage/page.tsx` - Internal usage with agent auth
- `app/api/sales/route.ts` - Dispatch API (no changes needed)
- `lib/types.ts` - Type definitions

---

## Notes

- Login page now uses dropdown for Operations role only
- Admin and Packer roles still use traditional username input
- Both login and internal usage pages use the same agent list
- Passwords are currently stored in frontend (not secure)
- Suitable for internal use with trusted staff
- **Must be enhanced before production deployment**
