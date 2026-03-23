# Export Button - Admin Only Access

## ✅ What Was Done

Nag-implement ng role-based visibility para sa export report buttons. Ngayon, **admin accounts lang** ang makakakita at makaka-access ng export functionality.

## 📝 Files Modified

### 1. Track Orders Page
**File:** `app/dashboard/track-orders/page.tsx`

**Changes:**
- Wrapped export button with `{!isTeamLeader && (...)}`
- Export button (PDF & Excel) visible sa admin lang
- Team leaders hindi makikita yung export button

### 2. Sales Channels List Page
**File:** `app/dashboard/sales-channels/page.tsx`

**Changes:**
- Added `getCurrentUserRole` import
- Added role detection: `const isTeamLeader = userRole === 'team_leader'`
- Wrapped export button with `{!isTeamLeader && (...)}`
- Export button visible sa admin lang

### 3. Sales Channel Detail Page
**File:** `app/dashboard/sales-channels/[id]/page.tsx`

**Changes:**
- Added `getCurrentUserRole` import
- Added role detection: `const isTeamLeader = userRole === 'team_leader'`
- Wrapped export button with `{!isTeamLeader && (...)}`
- Export button visible sa admin lang

### 4. Inventory Page (Products) ✨ NEW
**File:** `app/dashboard/inventory/page.tsx`

**Changes:**
- Added `getCurrentUserRole` import and `toast` from sonner
- Added role detection: `const isTeamLeader = userRole === 'team_leader'`
- **Created `exportToExcel()` function** - Exports inventory with all product details
- **Created `exportToPDF()` function** - Generates printable PDF with summary cards
- Added export button to page header (admin only)
- Export includes: Product name, category, SKU, sales channel, store, quantity, prices, profit margin, status

## 🎯 How It Works

```typescript
// Role detection
const userRole = getCurrentUserRole()
const isTeamLeader = userRole === 'team_leader'

// Conditional rendering
{!isTeamLeader && (
  <DropdownMenu>
    {/* Export button */}
  </DropdownMenu>
)}
```

## 📊 Pages with Export Buttons

### ✅ Admin Only (Updated)
- `/dashboard/track-orders` - Export orders as PDF/Excel
- `/dashboard/sales-channels` - Export all channels report
- `/dashboard/sales-channels/[id]` - Export specific channel report
- `/dashboard/inventory` - Export inventory/products report ✨ NEW

### ℹ️ No Export Buttons (No changes needed)
- `/dashboard/reports` - No export functionality
- `/dashboard/packing-queue` - No export functionality
- `/dashboard/dispatch` - No export functionality

### ⚠️ Settings Page Export
**File:** `app/dashboard/settings/page.tsx`
- Has "Export System Data" button
- This is for system backup/restore
- **Should this also be admin-only?** (Currently accessible to all)

## 📋 Inventory Export Features

### Excel Export
- Product Name
- Category
- SKU
- Sales Channel
- Store
- Quantity
- Reorder Level
- Cost Price
- Selling Price
- Profit Margin (%)
- Total Value
- Total COGS
- Status (In Stock / Low Stock / Out of Stock)
- Auto-sized columns
- Filename: `Inventory-Report-YYYY-MM-DD.xlsx`

### PDF Export
- Summary cards with totals:
  - Total Products
  - Total Quantity
  - Total Value
  - Total COGS
  - Low Stock Items
  - Out of Stock Items
- Detailed table with all products
- Color-coded status badges
- Print-optimized layout
- Respects current filters (sales channel, search)

## 🧪 Testing Checklist

### Admin Account
- [ ] Login as admin
- [ ] Go to Track Orders → Export button visible
- [ ] Go to Sales Channels → Export button visible
- [ ] Click on a channel → Export button visible
- [ ] Go to Inventory → Export button visible ✨ NEW
- [ ] Test PDF export from inventory
- [ ] Test Excel export from inventory
- [ ] Verify exported data is accurate

### Team Leader Account
- [ ] Login as team leader (Shopee/TikTok)
- [ ] Go to Track Orders → Export button HIDDEN
- [ ] Go to Sales Channels → Export button HIDDEN
- [ ] Click on a channel → Export button HIDDEN
- [ ] Go to Inventory → Export button HIDDEN ✨ NEW
- [ ] Verify no console errors

### Operations Account (if applicable)
- [ ] Login as operations
- [ ] Check if export buttons should be visible or hidden
- [ ] Update code if needed

## 💡 Additional Considerations

### Settings Page Export
The settings page has "Export System Data" functionality:
```typescript
<Button onClick={handleExportData}>
  <Download className="h-4 w-4 mr-2" />
  Export System Data
</Button>
```

**Question:** Should this also be admin-only?
- This exports system configuration and data
- Might contain sensitive information
- Recommend making it admin-only

### Future Pages
If you add export functionality to other pages:
1. Import `getCurrentUserRole` from `@/lib/role-utils`
2. Add role detection: `const isTeamLeader = userRole === 'team_leader'`
3. Wrap export button with `{!isTeamLeader && (...)}`

## 🚀 Deployment

```bash
# Test locally first
npm run dev

# Build to check for errors
npm run build

# If successful, commit and push
git add .
git commit -m "feat: Add export functionality to inventory page (admin only)"
git push origin main
```

## 📋 Summary

**Export buttons are now admin-only on:**
- Track Orders page
- Sales Channels list page
- Sales Channel detail page
- Inventory page (Products) ✨ NEW

**Team leaders will:**
- Not see export buttons
- Still have full access to view data
- Can still use filters and search

**Admin accounts will:**
- See all export buttons
- Can export reports as PDF or Excel
- Full functionality unchanged

---

**Status:** ✅ Complete
**Files Modified:** 4
**Testing Required:** Yes
**Ready to Deploy:** After testing

