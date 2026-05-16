# Latest GitHub Updates - Summary

## Date: May 16, 2026

### Commits Pulled

1. **236e356** - feat: Universal products and department-specific dispatch controls
2. **5979100** - Refactor: Change agent dropdown from hardcoded to dynamic loading
3. **fc5d280** - Fix: Update LoginForm to show individual agent accounts instead of departments

---

## 1. Universal Products & Department-Specific Dispatch (Commit 236e356)

### Changes Made

#### A. Products API (`app/api/items/route.ts`)
**BEFORE:**
- Products were filtered by department
- Operations users only saw their department's products

**AFTER:**
- ✅ **Products are now universal** - all users see all products
- No department/channel filtering on products
- Duplicate check now only by product name (not by store/channel)
- Operations users can create products (`withRoles(['admin', 'operations'])`)

```typescript
// Products are universal - all roles can see all products
// No department/channel filtering needed
```

#### B. Stores API (`app/api/stores/route.ts`)
**FIXED:**
- Fixed field name bug: `salesChannel` → `sales_channel`
- Department filtering still applies to stores
- Operations users only see stores from their assigned channel
- Operations users can create stores (`withRoles(['admin', 'operations'])`)

```typescript
// DEPARTMENT FILTERING: Operations users only see their department's stores
if (user.role === 'operations' && user.assignedChannel) {
  filteredStores = stores.filter(store => store.sales_channel === user.assignedChannel)
}
```

#### C. POS Dispatch Form (`app/dashboard/pos/page.tsx`)
**NEW FEATURE:**
- Sales Channel field is **locked** for operations users
- Operations users can only dispatch orders for their assigned channel
- Auto-fills sales channel based on user role:
  - **Operations**: Locked to their `assignedChannel` (e.g., "Lazada")
  - **Admin**: Can select any channel

```typescript
salesChannel: currentUserRole === 'operations' ? assignedChannel : (firstItem.salesChannel || '')
```

#### D. Categories API (`app/api/categories/route.ts`)
- Operations users can now create categories (`withRoles(['admin', 'operations'])`)

#### E. Navbar (`components/premium-navbar.tsx`)
- Removed command palette search bar from navbar center
- Cleaner UI

---

## 2. Dynamic Agent Loading (Commit 5979100)

### Changes Made

#### LoginForm Component (`components/auth/login-form.tsx`)
**BEFORE:**
- Agent accounts were hardcoded in dropdown
- Had to manually update code to add new agents

**AFTER:**
- ✅ **Dynamic loading** from API endpoint
- Fetches agents from `/api/departments/agents`
- Automatically shows all agents from database
- No code changes needed to add new agents

#### New API Endpoint (`app/api/departments/agents/route.ts`)
- Returns all operations users from database
- Grouped by department
- Includes username, display_name, assigned_channel

---

## 3. Individual Agent Accounts Fix (Commit fc5d280)

### Changes Made

#### LoginForm Component
**BEFORE:**
- Dropdown showed department names (Lazada, Facebook, etc.)
- Couldn't log in as individual agents

**AFTER:**
- ✅ Dropdown shows individual agent accounts
- Format: "Carlo (Lazada)", "Juan (Facebook)", etc.
- Username sent to API: "Lazada-Carlo", "Facebook-Juan", etc.

---

## Summary of Current System Behavior

### Products (Universal)
- ✅ All users see all products
- ✅ No department filtering
- ✅ Operations users can create products
- ✅ Duplicate check by name only

### Stores (Department-Specific)
- ✅ Operations users only see their department's stores
- ✅ Admin sees all stores
- ✅ Operations users can create stores

### Dispatch/Orders (Department-Specific)
- ✅ Operations users can only dispatch for their assigned channel
- ✅ Sales channel field is locked for operations users
- ✅ Admin can dispatch for any channel

### Packing Queue (Department-Specific)
- ✅ Operations users only see orders from their assigned channel
- ✅ Admin sees all orders
- ✅ Operations users can only view details (no pack button)
- ✅ Admin can pack orders

### Login System
- ✅ Dynamic agent loading from database
- ✅ Individual agent accounts (e.g., "Lazada-Carlo")
- ✅ Proper `assignedChannel` saved to localStorage
- ✅ Department filtering works correctly

---

## Testing Checklist

### Test Carlo's Account (Lazada)
- [ ] Login as "Carlo (Lazada)" with password `carlo123`
- [ ] Verify can see all products (universal)
- [ ] Verify can only see Lazada stores
- [ ] Verify sales channel is locked to "Lazada" in dispatch form
- [ ] Verify packing queue only shows Lazada orders
- [ ] Verify can create products, stores, categories

### Test Admin Account
- [ ] Login as admin
- [ ] Verify can see all products
- [ ] Verify can see all stores
- [ ] Verify can select any sales channel in dispatch form
- [ ] Verify packing queue shows all orders
- [ ] Verify can pack orders

---

## Files Modified in Latest Updates

1. `app/api/items/route.ts` - Universal products
2. `app/api/stores/route.ts` - Fixed field name bug
3. `app/api/categories/route.ts` - Operations can create
4. `app/dashboard/pos/page.tsx` - Locked sales channel for operations
5. `components/premium-navbar.tsx` - Removed command palette
6. `components/auth/login-form.tsx` - Dynamic agent loading
7. `app/api/departments/agents/route.ts` - New API endpoint

---

## Status

🟢 **ALL UPDATES PULLED SUCCESSFULLY**

Your local repository is now up to date with the latest changes from GitHub.

---

**Last Updated**: May 17, 2026
**Current Branch**: main
**Latest Commit**: 236e356
