# Quick Reference - Shared Pages Refactor

## ✅ Completed
- Track Orders page with role detection

## ⏳ Remaining
- Packing Queue page
- Dispatch page
- Update navigation links
- Delete old pages

## 🔧 Code Pattern

```typescript
// Add to any page that needs role detection
import { getCurrentUserRole, getAuthHeaders } from '@/lib/role-utils'

const userRole = getCurrentUserRole()
const isTeamLeader = userRole === 'team_leader'

// In fetch function:
if (isTeamLeader) {
  const headers = getAuthHeaders()
  const response = await fetch('/api/team-leader/orders', { headers })
} else {
  const data = await apiGet('/api/orders')
}
```

## 📁 Files Modified
- ✅ `app/dashboard/track-orders/page.tsx`

## 📁 Files To Create
- ⏳ `app/dashboard/packing-queue/page.tsx`
- ⏳ `app/dashboard/dispatch/page.tsx`

## 📁 Files To Update
- ⏳ `app/team-leader/layout.tsx` (navigation links)

## 📁 Files To Delete (After Testing)
- ⏳ `app/team-leader/track-orders/page.tsx`
- ⏳ `app/team-leader/packing-queue/page.tsx`
- ⏳ `app/team-leader/dispatch/page.tsx`

## 🧪 Testing Checklist
- [ ] Admin login → Track Orders → all orders visible
- [ ] Shopee TL → Track Orders → only Shopee orders
- [ ] TikTok TL → Track Orders → only TikTok orders
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] No console errors

## 📚 Documentation
- `SHARED-PAGES-REFACTOR-STATUS.md` - Overall status
- `REFACTOR-COMPLETE-TRACK-ORDERS.md` - Implementation details
- `TRACK-ORDERS-REFACTOR-VISUAL.md` - Visual guide
- `RESUME-SUMMARY.md` - Session summary
- `CURRENT-SESSION-COMPLETE.md` - What's done

## 🚀 Next Commands
- "continue refactor" - Continue with Packing Queue
- "test first" - Help test Track Orders
- "show code" - Show implementation details

---

**Status:** Track Orders ✅ | Packing Queue ⏳ | Dispatch ⏳
