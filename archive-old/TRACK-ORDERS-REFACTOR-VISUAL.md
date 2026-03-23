# Track Orders Page - Visual Implementation Guide

## Before Refactor ❌

```
┌─────────────────────────────────────────────────────────┐
│                    SEPARATE PAGES                        │
└─────────────────────────────────────────────────────────┘

Admin Track Orders:
/dashboard/track-orders/page.tsx
├─ Calls: /api/orders?status=Packed
├─ Shows: ALL orders (all channels)
└─ Permissions: Full access

Team Leader Track Orders:
/team-leader/track-orders/page.tsx
├─ Calls: /api/team-leader/orders
├─ Shows: Channel-specific orders
└─ Permissions: View only

❌ Problem: Code duplication, harder to maintain
```

## After Refactor ✅

```
┌─────────────────────────────────────────────────────────┐
│                    SHARED PAGE                           │
└─────────────────────────────────────────────────────────┘

/dashboard/track-orders/page.tsx
│
├─ Role Detection: getCurrentUserRole()
│
├─ IF Admin:
│  ├─ Calls: /api/orders?status=Packed
│  ├─ Shows: ALL orders (all channels)
│  └─ Permissions: Full access
│
└─ IF Team Leader:
   ├─ Calls: /api/team-leader/orders
   ├─ Shows: Channel-specific orders only
   └─ Permissions: View only

✅ Benefit: Single page, same UI, role-based data
```

## Code Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User Opens: /dashboard/track-orders                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Page Component Loads                                     │
│  const userRole = getCurrentUserRole()                   │
└──────────────────────────────────────────────────────────┘
                        ↓
                   ┌────┴────┐
                   │  Role?  │
                   └────┬────┘
                        │
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌───────────────┐              ┌────────────────┐
│     Admin     │              │  Team Leader   │
└───────────────┘              └────────────────┘
        ↓                               ↓
┌───────────────┐              ┌────────────────┐
│ apiGet(       │              │ fetch(         │
│  '/api/orders'│              │  '/api/team-   │
│  '?status=    │              │   leader/      │
│   Packed')    │              │   orders',     │
│               │              │  { headers })  │
└───────────────┘              └────────────────┘
        ↓                               ↓
┌───────────────┐              ┌────────────────┐
│ All Orders    │              │ Channel Orders │
│ (All Channels)│              │ (Shopee only)  │
└───────────────┘              └────────────────┘
        ↓                               ↓
        └───────────────┬───────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Transform Data to Match Order Interface                 │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Render Same UI (Table, Filters, Search, Modal)         │
└──────────────────────────────────────────────────────────┘
```

## User Experience

### Admin User Flow
```
1. Login as admin (username + password)
   ↓
2. Redirected to /dashboard
   ↓
3. Click "Track Orders" in sidebar
   ↓
4. See ALL orders from ALL channels:
   - Shopee orders
   - Lazada orders
   - Facebook orders
   - TikTok orders
   - Physical Store orders
   ↓
5. Can filter by channel, status, date
   ↓
6. Can edit/delete orders
```

### Team Leader User Flow (Shopee)
```
1. Login as team leader (select Shopee + password)
   ↓
2. Redirected to /dashboard → /team-leader/dashboard
   ↓
3. Click "Track Orders" in sidebar
   ↓
4. See ONLY Shopee orders:
   - ✅ Shopee orders
   - ❌ Lazada orders (hidden)
   - ❌ Facebook orders (hidden)
   - ❌ TikTok orders (hidden)
   - ❌ Physical Store orders (hidden)
   ↓
5. Can filter by status, date (channel pre-filtered)
   ↓
6. View only (no edit/delete)
```

## Data Filtering

### Admin - No Filtering
```sql
SELECT * FROM orders WHERE status = 'Packed'
-- Returns: ALL orders across ALL channels
```

### Team Leader - Channel Filtering
```sql
SELECT * FROM orders 
WHERE status = 'Packed' 
  AND sales_channel = 'Shopee'  -- Filtered by assigned_channel
-- Returns: ONLY Shopee orders
```

## API Authentication

### Admin Headers
```javascript
{
  'username': 'admin_user',
  'role': 'admin',
  'displayName': 'Admin Name'
}
```

### Team Leader Headers
```javascript
{
  'x-team-leader-user-id': 'uuid-here',
  'x-team-leader-channel': 'Shopee',
  'x-team-leader-role': 'team_leader'
}
```

## Security

### Role Detection
```typescript
// Client-side role detection
const userRole = getCurrentUserRole()
// Reads from localStorage:
// - 'userRole' for admin/operations
// - 'x-team-leader-role' for team leaders
```

### API-Level Filtering
```typescript
// Server-side filtering (API endpoint)
if (headers['x-team-leader-role'] === 'team_leader') {
  const channel = headers['x-team-leader-channel']
  // Filter orders by channel
  orders = orders.filter(o => o.sales_channel === channel)
}
```

## File Structure

```
app/
├── dashboard/
│   ├── track-orders/
│   │   └── page.tsx ✅ SHARED PAGE (with role detection)
│   └── page.tsx (dashboard with role redirect)
│
├── team-leader/
│   ├── dashboard/
│   │   └── page.tsx (separate - different KPIs)
│   ├── track-orders/
│   │   └── page.tsx ❌ TO BE DELETED (after testing)
│   └── layout.tsx (needs navigation update)
│
lib/
└── role-utils.ts ✅ Role detection utilities
```

## Summary

✅ **One page** serves both admin and team leader
✅ **Same UI** for consistent user experience
✅ **Different data** based on role and permissions
✅ **Secure filtering** at API level
✅ **Easy to maintain** - update once, affects both

---

**Next:** Apply same pattern to Packing Queue and Dispatch pages
