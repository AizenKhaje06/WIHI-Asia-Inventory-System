# Breaking Changes: Authentication System Update

**Date:** March 6, 2026  
**Change Type:** Role Removal  
**Severity:** HIGH - Breaking Change

---

## Summary

The `team_leader` role has been **removed** from the authentication system in `lib/auth.ts`. This is a breaking change that affects multiple components.

## Changes Made

### ✅ Completed
- **lib/auth.ts**: Removed `team_leader` from `UserRole` type
- **lib/auth.ts**: Removed `team_leader` from `ROLES` definition
- **lib/auth.ts**: Removed `team_leader` from `ROLE_ROUTES` mapping
- **lib/auth.ts**: Removed `team_leader` from `DEFAULT_PASSWORDS`
- **lib/auth.ts**: Removed `sales_channel` field from `User` interface

### ⚠️ Requires Action

#### 1. API Endpoint (HIGH PRIORITY)
**File:** `app/api/auth/team-leader-login/route.ts`
- **Status:** Still exists and functional
- **Issue:** Queries for `role='team_leader'` which no longer exists in type system
- **Impact:** Will return 401 for all requests (no matching users)
- **Recommendation:** 
  - **Option A:** Delete the file entirely
  - **Option B:** Update to return 410 Gone with deprecation message

#### 2. Middleware Configuration
**File:** `middleware.ts`
- **Status:** Still allows `/api/auth/team-leader-login` as public route
- **Issue:** Endpoint is accessible but non-functional
- **Recommendation:** Remove from public routes array

#### 3. Frontend Components
**Files to Check:**
- `app/page.tsx` - Login page (may have team leader option)
- `components/auth/login-form.tsx` - Login form component
- `components/auth/role-selector.tsx` - Role selection UI
- `app/team-leader/dashboard/page.tsx` - Team leader dashboard

**Recommendation:** Remove team leader UI elements

#### 4. Database Migration
**Issue:** Existing `team_leader` users in database
- **Impact:** Users with `role='team_leader'` cannot log in
- **Recommendation:** Create migration to:
  - Convert existing team_leader users to `operations` role
  - Or delete team_leader users if no longer needed

#### 5. Postman Collection
**File:** `.postman.json`
- **Status:** ✅ Updated with deprecation notice
- **Change:** Team leader tests now expect 401 status

---

## Migration Guide for Existing Team Leader Users

### Option 1: Convert to Operations Role
```sql
-- Update existing team leader users to operations role
UPDATE users 
SET role = 'operations' 
WHERE role = 'team_leader';
```

### Option 2: Delete Team Leader Users
```sql
-- Remove team leader users (if no longer needed)
DELETE FROM users 
WHERE role = 'team_leader';
```

---

## Testing Checklist

- [ ] Verify admin login still works
- [ ] Verify operations login still works
- [ ] Verify packer login still works
- [ ] Confirm team leader login returns appropriate error
- [ ] Test role-based route access
- [ ] Verify no UI elements reference team_leader role
- [ ] Run full Postman collection
- [ ] Check for TypeScript errors

---

## Rollback Plan

If this change needs to be reverted:

1. Restore `lib/auth.ts` from git history
2. Ensure database has team_leader users
3. Verify team leader login endpoint works
4. Update Postman collection tests

---

## Related Files

### Core Authentication
- `lib/auth.ts` - Role definitions (MODIFIED)
- `lib/role-utils.ts` - Role utility functions
- `lib/team-leader-auth.ts` - Team leader session management
- `lib/team-leader-middleware.ts` - Team leader middleware

### API Routes
- `app/api/auth/team-leader-login/route.ts` - Login endpoint (NEEDS UPDATE)
- `app/api/auth/channels/route.ts` - Channel listing

### Frontend
- `app/page.tsx` - Main login page
- `app/team-leader/dashboard/page.tsx` - Team leader dashboard
- `app/team-leader/layout.tsx` - Team leader layout

### Middleware
- `middleware.ts` - Route protection

---

## Recommendations

### Immediate Actions (Required)
1. **Delete or deprecate** `app/api/auth/team-leader-login/route.ts`
2. **Remove** team leader route from middleware
3. **Run database migration** to handle existing team_leader users
4. **Remove** team leader UI components

### Follow-up Actions (Recommended)
1. Delete `lib/team-leader-auth.ts` if no longer used
2. Delete `lib/team-leader-middleware.ts` if no longer used
3. Delete `app/team-leader/` directory
4. Update documentation
5. Notify users of role changes

---

## API Test Results

Run Postman collection to verify:
```bash
# Expected results after cleanup:
# - Admin login: ✅ 200 OK
# - Operations login: ✅ 200 OK  
# - Packer login: ✅ 200 OK
# - Team leader login: ⚠️ 401 Unauthorized (expected)
```

---

**Status:** ⚠️ INCOMPLETE - Requires cleanup of deprecated components
