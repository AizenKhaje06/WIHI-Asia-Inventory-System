# Internal Usage Page - Visual Guide 🎨

## What You Should See

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Internal Usage                                                  │
│  Track items for demo displays and internal company use         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│  Dispatch Information        │  Cart Summary          ₱0.00     │
│                              │                                   │
│  Purpose *                   │  [Empty cart icon]                │
│  [Select purpose ▼]          │  No items in cart                 │
│                              │  Select products below to add     │
│  Notes (Optional)            │                                   │
│  [Purpose or notes...]       │                                   │
│                              │                                   │
│  Dispatched By *             │                                   │
│  ┌─────────────────────────┐ │                                   │
│  │ [J] John Doe            │ │                                   │
│  │ ● Currently logged in   │ │                                   │
│  │                [Verified]│ │                                   │
│  └─────────────────────────┘ │                                   │
│  🔒 Auto-verified from your  │                                   │
│     account for security     │                                   │
│                              │                                   │
│  [Dispatch]                  │                                   │
└──────────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Products (24)                    [🔍 Search products...]        │
│                                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                       │
│  │ [50] │  │ [30] │  │ [15] │  │ OUT  │                       │
│  │      │  │      │  │ LOW  │  │      │                       │
│  │      │  │      │  │      │  │      │                       │
│  │ Item │  │ Item │  │ Item │  │ Item │                       │
│  │ Name │  │ Name │  │ Name │  │ Name │                       │
│  │      │  │      │  │      │  │      │                       │
│  │₱99.00│  │₱49.00│  │₱79.00│  │₱29.00│                       │
│  │COST  │  │COST  │  │COST  │  │COST  │                       │
│  │PRICE │  │PRICE │  │PRICE │  │PRICE │                       │
│  └──────┘  └──────┘  └──────┘  └──────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### When Purpose is Selected

#### Demo/Display or Internal Use Selected:
```
┌──────────────────────────────┐
│  Dispatch Information        │
│                              │
│  Purpose *                   │
│  [Demo/Display ▼]            │  ← Selected
│                              │
│  Sales Channel *             │  ← NEW! Appears
│  [Select sales channel ▼]   │
│  (Where will this be used?)  │
│                              │
│  This will be saved as:      │
│  Demo/Display / ...          │
└──────────────────────────────┘
```

#### Warehouse Transfer Selected:
```
┌──────────────────────────────┐
│  Dispatch Information        │
│                              │
│  Purpose *                   │
│  [Warehouse Transfer ▼]      │  ← Selected
│                              │
│  Notes (Optional)            │  ← Sales Channel hidden
│  [Purpose or notes...]       │
└──────────────────────────────┘
```

### Sales Channel Dropdown Options

```
┌──────────────────────────────┐
│  Sales Channel *             │
│  ┌──────────────────────────┐│
│  │ 📘 Facebook Store        ││
│  │ 🎵 TikTok Shop           ││
│  │ 🛒 Lazada                ││
│  │ 🛍️ Shopee                ││
│  │ 🏪 Physical Store        ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

### Cart with Items

```
┌──────────────────────────────────┐
│  Cart Summary          ₱1,234.56 │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ Product Name                │ │
│  │ ₱99.00 × 5                  │ │
│  │              [5] [🗑️] ₱495.00│ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ Another Product             │ │
│  │ ₱49.00 × 3                  │ │
│  │              [3] [🗑️] ₱147.00│ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

### Product Card States

#### Normal Stock (Clickable):
```
┌──────────────────┐
│            [50]  │  ← Stock badge
│                  │
│                  │
│  Product Name    │
│  Electronics     │
│                  │
│  ₱99.00          │
│  [COST PRICE]    │
│                  │
│  Stock: 50 units │
│  Store: Main     │
│                  │
│  🛒 Click to add │  ← Hover effect
└──────────────────┘
```

#### Low Stock (Warning):
```
┌──────────────────┐
│ [LOW]      [15]  │  ← Low stock badge
│                  │
│  Product Name    │
│  ₱79.00          │
│  [COST PRICE]    │
└──────────────────┘
```

#### Out of Stock (Disabled):
```
┌──────────────────┐
│            [OUT] │  ← Red badge
│                  │
│  Product Name    │  ← Grayed out
│  ₱29.00          │
│  [COST PRICE]    │
└──────────────────┘
```

### Success Modal

```
┌─────────────────────────────────────┐
│  ✓ Items Dispatched Successfully!   │
│                                      │
│  ┌─────────────────────────────────┐│
│  │  Internal Usage Recorded        ││
│  │  Dispatch ID: INT-1234567890    ││
│  └─────────────────────────────────┘│
│                                      │
│  ┌─────────────────────────────────┐│
│  │  Dispatched Items               ││
│  ├─────────────────────────────────┤│
│  │ Product Name                    ││
│  │ ₱99.00 × 5              ₱495.00 ││
│  ├─────────────────────────────────┤│
│  │ Another Product                 ││
│  │ ₱49.00 × 3              ₱147.00 ││
│  ├─────────────────────────────────┤│
│  │ Total                 ₱1,234.56 ││
│  └─────────────────────────────────┘│
│                                      │
│  ✓ Inventory has been updated       │
│  ✓ Transaction logged successfully  │
│  ✓ Staff: John Doe                  │
│                                      │
│  [Close]                             │
└─────────────────────────────────────┘
```

## Color Scheme

### Gradients
- **Primary**: Purple (#9333EA) to Blue (#2563EB)
- **Headers**: Slate-800 to Slate-900
- **Channel Badges**: Orange to Red

### Status Colors
- **Low Stock**: Amber (warning)
- **Out of Stock**: Red (error)
- **Success**: Green
- **Info**: Blue
- **Verified**: Blue

### Text Colors
- **Primary**: Slate-900 (dark) / White (light)
- **Secondary**: Slate-600 (dark) / Slate-400 (light)
- **Muted**: Slate-500 (dark) / Slate-500 (light)

## Interactive Elements

### Hover Effects
- Product cards: Lift up, shadow increase, border color change
- Buttons: Gradient shift, slight scale
- Cart items: Background color change

### Click Effects
- Product cards: Scale down (active state)
- Buttons: Ripple effect
- Remove button: Red background on hover

### Animations
- Page load: Fade in + slide from top
- Sales channel: Fade in + slide from top
- Cart updates: Smooth transitions
- Modal: Fade in + scale

## Toast Notifications

### Add to Cart:
```
✓ Product Name added to cart
```

### Quantity Increased:
```
➕ Product Name quantity increased to 3
```

### Maximum Stock:
```
⚠️ Maximum stock reached for Product Name
```

## Form Validation

### Required Fields:
1. **Purpose** - Must select one option
2. **Sales Channel** - Required only for Demo/Display and Internal Use
3. **Dispatched By** - Auto-filled (always valid)
4. **Cart** - Must have at least 1 item

### Validation Messages:
- "Please add items and select a purpose"
- "Please select a sales channel"

## Responsive Behavior

### Desktop (lg+):
- 2-column layout (Dispatch Form | Cart Summary)
- 4-column product grid

### Tablet (md):
- 2-column layout maintained
- 3-column product grid

### Mobile (sm):
- Single column layout
- 2-column product grid

### Extra Small:
- Single column layout
- 1-column product grid

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance
- Semantic HTML structure

## Performance

- Memoized filtered items
- Memoized cart total
- Optimized re-renders
- Lazy loading for large product lists
- Debounced search input
