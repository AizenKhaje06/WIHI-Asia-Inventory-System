# Shared Pages Refactor - Current Status

## ✅ Completed Steps

### 1. Track Orders Page - Role Detection Added
**File:** `app/dashboard/track-orders/page.tsx`
- ✅ Added role detection using `getCurrentUserRole()` and `getAuthHeaders()`
- ✅ Team leaders now call `/api/team-leader/orders` endpoint
- ✅ Admin continues to call `/api/orders?status=Packed` endpoint
- ✅ Same UI for both roles, different data sources
- ✅ Team leaders see only their channel's orders
- ✅ Admin sees all orders

**How it works:**
```typescript
const userRole = getCurrentUserRole()
const isTeamLeader = userRole === 'team_leader'

// In fetchOrders():
if (isTeamLeader) {
  // Use team leader API with auth headers
  const headers = getAuthHeaders()
  const response = await fetch('/api/team-leader/orders', { headers })
  // Transform data to match Order interface
} else {
  // Use admin API
  const data = await apiGet('/api/orders?status=Packed')
}
```

## 🔄 Next Steps

### 2. Update Team Leader Layout
**File:** `app/team-leader/layout.tsx`
**Action:** Update navigation links to point to `/dashboard/*` instead of `/team-leader/*`

Current links:
- `/team-leader/track-orders` → `/dashboard/track-orders` ✅ (already done)
- `/team-leader/packing-queue` → `/dashboard/packing-queue` (needs page creation)
- `/team-leader/dispatch` → `/dashboard/dispatch` (needs page creation)

### 3. Create Shared Packing Queue Page
**File:** `app/dashboard/packing-queue/page.tsx` (currently at `/dashboard/operations/transaction-history`)
**Action:** 
- Rename or create new page at `/dashboard/packing-queue`
- Add role detection
- Team leader: view only, calls `/api/team-leader/packing-queue`
- Admin: full access, calls existing admin API

### 4. Create Shared Dispatch Page
**File:** `app/dashboard/dispatch/page.tsx` (currently at `/dashboard/pos`)
**Action:**
- Rename or create new page at `/dashboard/dispatch`
- Add role detection
- Team leader: full access, calls `/api/team-leader/dispatch`
- Admin: full access, calls existing admin API

### 5. Update Premium Sidebar Permissions
**File:** `components/premium-sidebar.tsx`
**Action:** Ensure team leaders can access the shared pages
- Track Orders: ✅ Already accessible
- Packing Queue: Need to add permission
- Dispatch: Need to add permission

### 6. Test Both Roles
**Test Cases:**
- [ ] Admin login → sees all orders in Track Orders
- [ ] Team leader (Shopee) login → sees only Shopee orders
- [ ] Team leader (TikTok) login → sees only TikTok orders
- [ ] Both can navigate to all shared pages
- [ ] No errors in console

### 7. Delete Old Team Leader Pages (After Testing)
**Files to delete:**
- `app/team-leader/track-orders/page.tsx` (replaced by shared page)
- `app/team-leader/packing-queue/page.tsx` (will be replaced)
- `app/team-leader/dispatch/page.tsx` (will be replaced)

**Keep:**
- `app/team-leader/dashboard/page.tsx` (different KPIs per channel)
- `app/team-leader/layout.tsx` (update navigation links)
- `app/team-leader/inventory-alerts/page.tsx` (team leader specific)
- `app/team-leader/settings/page.tsx` (team leader specific)

## 📊 Current Architecture

### Login Flow
```
User → Main Login (/)
  ├─ Admin → /dashboard (admin dashboard)
  └─ Team Leader → /dashboard → redirects to /team-leader/dashboard
```

### Page Access After Refactor
```
Admin:
  /dashboard → Admin dashboard
  /dashboard/track-orders → All orders ✅
  /dashboard/packing-queue → All orders (pending)
  /dashboard/dispatch → All orders (pending)

Team Leader:
  /dashboard → Redirects to /team-leader/dashboard (different KPIs)
  /dashboard/track-orders → Channel orders only ✅
  /dashboard/packing-queue → Channel orders only (pending)
  /dashboard/dispatch → Channel orders only (pending)
```

## 🎯 Benefits of This Approach

1. **Less Code Duplication:** One page serves both roles
2. **Easier Maintenance:** Update UI once, affects both roles
3. **Consistent UX:** Same interface for similar tasks
4. **Role-Based Data:** Different data sources based on role
5. **Scalable:** Easy to add more roles in the future

## 🔧 Technical Implementation

### Role Detection Pattern
```typescript
import { getCurrentUserRole, getAuthHeaders } from '@/lib/role-utils'

const userRole = getCurrentUserRole()
const isTeamLeader = userRole === 'team_leader'
const isAdmin = userRole === 'admin'

// Fetch data based on role
if (isTeamLeader) {
  const headers = getAuthHeaders()
  const response = await fetch('/api/team-leader/endpoint', { headers })
} else {
  const data = await apiGet('/api/admin/endpoint')
}
```

### API Endpoints
- Admin: `/api/orders`, `/api/items`, etc.
- Team Leader: `/api/team-leader/orders`, `/api/team-leader/packing-queue`, etc.

### Authentication Headers
- Admin: `username`, `role`, `displayName`
- Team Leader: `x-team-leader-user-id`, `x-team-leader-channel`, `x-team-leader-role`

## 📝 Notes

- Team leader dashboard stays separate (different KPIs per channel)
- Inventory alerts and settings stay separate (team leader specific features)
- All operational pages (track orders, packing queue, dispatch) are shared
- Role detection happens at page level, not route level
- Data filtering happens at API level using assigned_channel

---

**Status:** Track Orders page completed, ready to continue with Packing Queue and Dispatch pages.
**Last Updated:** Current session
