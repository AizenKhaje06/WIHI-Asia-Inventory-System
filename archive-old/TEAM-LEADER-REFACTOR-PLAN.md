# Team Leader Refactor Plan - Option B

## Goal
Merge team leader and admin pages to use the same UI components with role-based logic.

## Current Structure (Separate Pages)
```
/app/admin/track-orders/page.tsx          → Admin only
/app/team-leader/track-orders/page.tsx    → Team leader only
/app/team-leader/packing-queue/page.tsx   → Team leader only
/app/team-leader/dispatch/page.tsx        → Team leader only
/app/team-leader/dashboard/page.tsx       → Team leader only
/app/team-leader/inventory-alerts/page.tsx → Team leader only
/app/team-leader/settings/page.tsx        → Team leader only
```

## New Structure (Shared Pages)
```
/app/dashboard/track-orders/page.tsx      → Admin + Team Leader (role-based)
/app/dashboard/packing-queue/page.tsx     → Admin + Team Leader (role-based)
/app/dashboard/dispatch/page.tsx          → Admin + Team Leader (role-based)
/app/dashboard/page.tsx                   → Admin dashboard
/app/team-leader/dashboard/page.tsx       → Team leader dashboard (keep separate, different KPIs)
/app/dashboard/inventory-alerts/page.tsx  → Admin + Team Leader (role-based)
/app/dashboard/settings/page.tsx          → Already shared
```

## Changes Required

### 1. Update Main Login Page
- ✅ Already done - Staff login redirects to `/team-leader/dashboard`
- Keep team leader dashboard separate (different KPIs per channel)

### 2. Create Shared Track Orders Page
**Location:** `/app/dashboard/track-orders/page.tsx`
- Detect user role (admin vs team_leader)
- Use appropriate API endpoint
- Admin: `/api/orders` (all orders)
- Team Leader: `/api/team-leader/orders` (filtered by channel)
- Same UI for both

### 3. Create Shared Packing Queue Page
**Location:** `/app/dashboard/packing-queue/page.tsx`
- Admin: Full access to edit
- Team Leader: View only
- Use role to determine permissions

### 4. Create Shared Dispatch Page
**Location:** `/app/dashboard/dispatch/page.tsx`
- Both admin and team leader have full access
- Team leader sees only their channel's orders

### 5. Create Shared Inventory Alerts Page
**Location:** `/app/dashboard/inventory-alerts/page.tsx`
- Admin: All channels
- Team Leader: Their channel only

### 6. Update Sidebar Navigation
**File:** `components/premium-sidebar.tsx`
- Show same menu items for both roles
- Links point to `/dashboard/*` instead of `/team-leader/*`
- Team leader dashboard link stays at `/team-leader/dashboard`

### 7. Create Role Detection Utility
**File:** `lib/role-utils.ts`
```typescript
export function getCurrentUserRole() {
  // Check if team leader
  const teamLeaderRole = localStorage.getItem('x-team-leader-role')
  if (teamLeaderRole) return 'team_leader'
  
  // Check if admin/operations
  const userRole = localStorage.getItem('userRole')
  return userRole || null
}

export function getAuthHeaders() {
  const role = getCurrentUserRole()
  
  if (role === 'team_leader') {
    return {
      'x-team-leader-user-id': localStorage.getItem('x-team-leader-user-id'),
      'x-team-leader-channel': localStorage.getItem('x-team-leader-channel'),
      'x-team-leader-role': localStorage.getItem('x-team-leader-role')
    }
  }
  
  return {
    'username': localStorage.getItem('username'),
    'role': localStorage.getItem('userRole'),
    'displayName': localStorage.getItem('displayName')
  }
}
```

### 8. Delete Old Team Leader Pages
- Delete `/app/team-leader/track-orders/`
- Delete `/app/team-leader/packing-queue/`
- Delete `/app/team-leader/dispatch/`
- Delete `/app/team-leader/inventory-alerts/`
- Delete `/app/team-leader/settings/` (use shared settings)
- Keep `/app/team-leader/dashboard/` (different KPIs)
- Keep `/app/team-leader/layout.tsx` (team leader wrapper)

### 9. Update Team Leader Layout
**File:** `/app/team-leader/layout.tsx`
- Update sidebar links to point to `/dashboard/*`
- Keep dashboard link at `/team-leader/dashboard`

## Benefits

✅ **Less code duplication** - One page instead of two
✅ **Consistent UI** - Guaranteed same design
✅ **Easier maintenance** - Fix once, applies to all
✅ **Better scalability** - Easy to add more roles later
✅ **Same URLs** - Cleaner structure

## Migration Steps

1. Create role detection utility
2. Create shared track orders page
3. Create shared packing queue page
4. Create shared dispatch page
5. Create shared inventory alerts page
6. Update sidebar navigation
7. Update team leader layout
8. Test both admin and team leader access
9. Delete old team leader pages
10. Update documentation

## Testing Checklist

### Admin Testing
- [ ] Login as admin
- [ ] Access track orders - see all orders
- [ ] Access packing queue - can edit
- [ ] Access dispatch - can dispatch
- [ ] Access inventory alerts - see all channels

### Team Leader Testing (Shopee)
- [ ] Login as Shopee team leader
- [ ] Access track orders - see only Shopee orders
- [ ] Access packing queue - view only
- [ ] Access dispatch - can dispatch Shopee orders
- [ ] Access inventory alerts - see only Shopee alerts
- [ ] Dashboard shows Shopee KPIs

### Team Leader Testing (TikTok)
- [ ] Login as TikTok team leader
- [ ] Same tests as Shopee but for TikTok channel

## Rollback Plan

If issues occur:
1. Restore deleted team leader pages from git history
2. Revert sidebar changes
3. Revert login redirect changes
