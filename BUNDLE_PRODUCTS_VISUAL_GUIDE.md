# Bundle Products - Visual Guide 📸

## Where to Find the Create Bundle Button

### Location: Warehouse Dispatch Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Warehouse Dispatch                    [📦 Create Bundle]       │
│  Stock release and distribution management                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ Dispatch Information     │  │ Cart Summary             │   │
│  │                          │  │                          │   │
│  │ [Dispatched By Box]      │  │ ₱0.00                    │   │
│  │                          │  │                          │   │
│  │ [Dispatch Button]        │  │ No items in cart         │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Products (X)                          [Search...]        │  │
│  │                                                           │  │
│  │  [Product Cards Grid]                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Button Location**: Top-right corner, next to page title

---

## Create Bundle Dialog

When you click "Create Bundle", this dialog opens:

```
┌─────────────────────────────────────────────────────────────────┐
│  📦 Create Product Bundle                                  [X]  │
│  Create a bundle of products with special pricing               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │ BUNDLE INFO          │  │ BUNDLE ITEMS                 │   │
│  │                      │  │                              │   │
│  │ Bundle Name *        │  │ Add Items to Bundle *        │   │
│  │ [____________]       │  │ [Select item to add ▼]       │   │
│  │                      │  │                              │   │
│  │ Description          │  │ Bundle Contents (0 items)    │   │
│  │ [____________]       │  │ ┌──────────────────────────┐ │   │
│  │                      │  │ │                          │ │   │
│  │ Category *  Store *  │  │ │  No items added yet      │ │   │
│  │ [_____▼]   [_____▼]  │  │ │                          │ │   │
│  │                      │  │ └──────────────────────────┘ │   │
│  │ Badge (Optional)     │  │                              │   │
│  │ [____________]       │  │                              │   │
│  │                      │  │                              │   │
│  │ ┌──────────────────┐ │  │                              │   │
│  │ │ Pricing Summary  │ │  │                              │   │
│  │ │ Regular: ₱0.00   │ │  │                              │   │
│  │ │ Cost: ₱0.00      │ │  │                              │   │
│  │ │ Savings: ₱0.00   │ │  │                              │   │
│  │ │ Profit: ₱0.00    │ │  │                              │   │
│  │ └──────────────────┘ │  │                              │   │
│  │                      │  │                              │   │
│  │ Bundle Price *       │  │                              │   │
│  │ [____________]       │  │                              │   │
│  └──────────────────────┘  └──────────────────────────────┘   │
│                                                                  │
│                                    [Cancel]  [Create Bundle]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Visual Flow

### Step 1: Click Create Bundle Button
```
┌─────────────────────────────────────────────┐
│  Warehouse Dispatch    [📦 Create Bundle] ← Click here
└─────────────────────────────────────────────┘
```

### Step 2: Fill Bundle Name
```
┌──────────────────────┐
│ Bundle Name *        │
│ [Berry Soap 3-Pack_] │ ← Type bundle name
└──────────────────────┘
```

### Step 3: Select Category & Store
```
┌──────────────────────┐
│ Category *  Store *  │
│ [Soap ▼]   [Main ▼]  │ ← Select from dropdowns
└──────────────────────┘
```

### Step 4: Add Items
```
┌──────────────────────────────┐
│ Add Items to Bundle *        │
│ [Berry Soap ▼]               │ ← Select item
└──────────────────────────────┘

After adding:
┌──────────────────────────────┐
│ Bundle Contents (1 item)     │
│ ┌──────────────────────────┐ │
│ │ Berry Soap               │ │
│ │ ₱100.00 each    [3] [X]  │ │ ← Set quantity
│ │                  ₱300.00 │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Step 5: View Pricing Summary
```
┌──────────────────────┐
│ Pricing Summary      │
│ Regular: ₱300.00     │ ← Auto-calculated
│ Cost: ₱120.00        │
│ Savings: ₱50.00      │ ← Updates when you set price
│ Profit: ₱130.00      │
└──────────────────────┘
```

### Step 6: Set Bundle Price
```
┌──────────────────────┐
│ Bundle Price *       │
│ [250.00_]            │ ← Enter bundle price
└──────────────────────┘
```

### Step 7: Create Bundle
```
┌──────────────────────────────┐
│  [Cancel]  [Create Bundle]   │ ← Click to save
└──────────────────────────────┘
```

### Step 8: Success!
```
┌──────────────────────────────┐
│ ✓ Bundle created successfully!│ ← Toast notification
└──────────────────────────────┘
```

---

## Real Example: Berry Soap 3-Pack

### Input
```
Bundle Name: Berry Soap 3-Pack
Description: Save on our best-selling berry soap
Category: Soap
Store: Main Warehouse
Badge: BEST VALUE

Items:
- Berry Soap × 3 @ ₱100 each

Bundle Price: ₱250
```

### Auto-Calculated Results
```
┌──────────────────────────────┐
│ Pricing Summary              │
│ Regular Price:    ₱300.00    │
│ Bundle Cost:      ₱120.00    │
│ Customer Saves:   ₱50.00     │ (16.7%)
│ Your Profit:      ₱130.00    │ (52% margin)
└──────────────────────────────┘
```

### Saved to Database
```sql
bundles table:
- id: BUNDLE-1234567890
- name: Berry Soap 3-Pack
- bundle_price: 250.00
- regular_price: 300.00
- savings: 50.00

bundle_items table:
- bundle_id: BUNDLE-1234567890
- item_id: ITEM-BERRY-SOAP
- quantity: 3
```

---

## Button Styling

The Create Bundle button has:
- 📦 Package icon
- Blue outline border
- Hover effect (light blue background)
- Positioned in top-right corner
- Enterprise-grade styling

```css
Style:
- Border: Blue (light/dark mode adaptive)
- Background: Transparent → Blue on hover
- Icon: Package (📦)
- Text: "Create Bundle"
```

---

## Color Indicators

### Pricing Summary Colors
- **Regular Price**: Default text color
- **Bundle Cost**: Default text color
- **Savings**: Green (good for customer)
- **Profit**: Blue (good for you)

### Validation
- **Price below cost**: Red warning text
- **Required fields**: Asterisk (*)
- **Success**: Green toast notification

---

## Mobile Responsive

The dialog is fully responsive:
- Desktop: 2-column layout (info | items)
- Tablet: 2-column layout (stacked)
- Mobile: Single column (info → items)

---

## Keyboard Shortcuts

- **Esc**: Close dialog
- **Tab**: Navigate between fields
- **Enter**: Submit form (when all fields valid)

---

## Tips for Best Results

1. **Use descriptive names**: "Berry Soap 3-Pack" not "Bundle 1"
2. **Add badges**: "BEST VALUE", "SAVE 20%", "LIMITED TIME"
3. **Price strategically**: Show clear savings (at least 10-15%)
4. **Group related items**: Same category or complementary products
5. **Check profit margins**: Ensure you're still profitable

---

## Common Use Cases

### 1. Multi-Pack Bundles
```
Name: Berry Soap 3-Pack
Items: 3× Berry Soap
Price: ₱250 (was ₱300)
Savings: ₱50
```

### 2. Variety Bundles
```
Name: Soap Sampler Pack
Items: 1× Berry Soap, 1× Lemon Soap, 1× Mint Soap
Price: ₱280 (was ₱330)
Savings: ₱50
```

### 3. Gift Sets
```
Name: Spa Gift Set
Items: 2× Soap, 1× Lotion, 1× Scrub
Price: ₱450 (was ₱550)
Savings: ₱100
```

---

## What Happens After Creation

1. **Bundle saved** to database
2. **Toast notification** appears
3. **Dialog closes** automatically
4. **Items list refreshes** (future: bundles will appear here)
5. **Ready to dispatch** (future feature)

---

## Next Steps

After creating bundles, you can:
1. View them in database (Supabase)
2. Create more bundles
3. Wait for Phase 4: Display bundles in product list
4. Wait for Phase 5: Dispatch bundles

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  BUNDLE CREATION QUICK REFERENCE        │
├─────────────────────────────────────────┤
│  Location: Warehouse Dispatch page      │
│  Button: Top-right "Create Bundle"      │
│                                          │
│  Required Fields:                       │
│  ✓ Bundle Name                          │
│  ✓ Category                             │
│  ✓ Store                                │
│  ✓ At least 1 item                      │
│  ✓ Bundle Price (above cost)            │
│                                          │
│  Optional Fields:                       │
│  • Description                          │
│  • Badge                                │
│  • SKU                                  │
│                                          │
│  Auto-Calculated:                       │
│  • Regular Price                        │
│  • Bundle Cost                          │
│  • Savings                              │
│  • Profit Margin                        │
└─────────────────────────────────────────┘
```

---

**Status**: ✅ LIVE AND READY TO USE
**Access**: Warehouse Dispatch → Create Bundle button
**Time to Create**: ~2 minutes per bundle

🎉 Start creating bundles now!
