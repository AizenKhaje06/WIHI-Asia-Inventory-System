# 🎨 Bundle Edit Dialog - Visual Mockup

## 📱 DESIGN PREVIEW

```
╔════════════════════════════════════════════════════════════════╗
║  📦 Edit Bundle Product                            [Bundle] ✕  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  BUNDLE INFORMATION                                            ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  Bundle Name                                                   ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ BUNDLE 1                                                 │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  Category                    Sales Channel                    ║
║  ┌─────────────────────┐    ┌─────────────────────────────┐  ║
║  │ Fashion & Apparel ▼ │    │ Lazada                    ▼ │  ║
║  └─────────────────────┘    └─────────────────────────────┘  ║
║                                                                ║
║  Store                       SKU                              ║
║  ┌─────────────────────┐    ┌─────────────────────────────┐  ║
║  │ GLOWMANCE         ▼ │    │ BDL-BUNDLE-2X-1234          │  ║
║  └─────────────────────┘    └─────────────────────────────┘  ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  BUNDLE COMPONENTS                                             ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 📦 Product A                                             │ ║
║  │ Quantity: 2 units  │  Stock: 50  │  Cost: ₱50 × 2      │ ║
║  │ Subtotal: ₱100                                           │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 📦 Product B                                             │ ║
║  │ Quantity: 1 unit   │  Stock: 30  │  Cost: ₱80 × 1      │ ║
║  │ Subtotal: ₱80                                            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║  PRICING & STOCK                                               ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  Total Cost (Auto)           Selling Price                    ║
║  ┌─────────────────────┐    ┌─────────────────────────────┐  ║
║  │ ₱180 (read-only)    │    │ ₱499                        │  ║
║  └─────────────────────┘    └─────────────────────────────┘  ║
║                                                                ║
║  Profit Margin               Virtual Stock (Auto)             ║
║  ┌─────────────────────┐    ┌─────────────────────────────┐  ║
║  │ 64% (₱319)          │    │ 100 bundles (read-only)     │  ║
║  └─────────────────────┘    └─────────────────────────────┘  ║
║                                                                ║
║  ℹ️ Virtual stock is calculated from component availability   ║
║                                                                ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║                    [Cancel]  [Save Changes]                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🎨 COLOR SCHEME

### Bundle Badge
```
┌─────────┐
│ Bundle  │  ← Purple gradient badge
└─────────┘
```

### Component Cards
```
┌────────────────────────────────────┐
│ 📦 Product Name                    │  ← Light blue/slate background
│ Details...                         │  ← Hover effect
└────────────────────────────────────┘
```

### Profit Margin
```
┌──────────────┐
│ 64% margin   │  ← Green if >30%, Amber if 15-30%, Red if <15%
└──────────────┘
```

---

## 📊 DETAILED SECTIONS

### 1. HEADER
```
┌────────────────────────────────────────────┐
│ 📦 Edit Bundle Product        [Bundle] ✕   │
│                                            │
│ Orange gradient icon + title               │
│ Purple "Bundle" badge on right             │
└────────────────────────────────────────────┘
```

### 2. BUNDLE INFORMATION
```
┌────────────────────────────────────────────┐
│ BUNDLE INFORMATION                         │
│ ──────────────────────────────────────────│
│                                            │
│ • Bundle Name (editable)                   │
│ • Category (dropdown)                      │
│ • Sales Channel (dropdown)                 │
│ • Store (dropdown, filtered by channel)    │
│ • SKU (read-only, auto-generated)          │
└────────────────────────────────────────────┘
```

### 3. BUNDLE COMPONENTS (NEW!)
```
┌────────────────────────────────────────────┐
│ BUNDLE COMPONENTS                          │
│ ──────────────────────────────────────────│
│                                            │
│ For each component:                        │
│ ┌──────────────────────────────────────┐  │
│ │ 📦 Product Name                      │  │
│ │                                      │  │
│ │ Quantity: 2 units                    │  │
│ │ Current Stock: 50 units              │  │
│ │ Unit Cost: ₱50                       │  │
│ │ Subtotal: ₱100                       │  │
│ │                                      │  │
│ │ [Can make: 25 bundles]               │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ • Scrollable if many components            │
│ • Shows stock availability                 │
│ • Color-coded stock warnings               │
└────────────────────────────────────────────┘
```

### 4. PRICING & STOCK
```
┌────────────────────────────────────────────┐
│ PRICING & STOCK                            │
│ ──────────────────────────────────────────│
│                                            │
│ Total Cost: ₱180 (auto, read-only)         │
│ Selling Price: ₱499 (editable)             │
│                                            │
│ Profit Margin: 64% (₱319)                  │
│ ├─ Green badge if >30%                     │
│ ├─ Amber badge if 15-30%                   │
│ └─ Red badge if <15%                       │
│                                            │
│ Virtual Stock: 100 bundles (auto)          │
│ └─ Calculated from lowest component stock  │
│                                            │
│ ℹ️ Info message about virtual stock        │
└────────────────────────────────────────────┘
```

---

## 🎯 INTERACTIVE FEATURES

### Component Cards - Hover State
```
┌────────────────────────────────────┐
│ 📦 Product A                       │  ← Hover: border turns blue
│ Quantity: 2 units                  │  ← Hover: slight elevation
│ Stock: 50 units                    │  ← Hover: background lightens
│ Cost: ₱50 × 2 = ₱100               │
└────────────────────────────────────┘
```

### Stock Warnings
```
┌────────────────────────────────────┐
│ 📦 Product C                       │
│ Quantity: 5 units                  │
│ Stock: 8 units ⚠️ LOW STOCK        │  ← Yellow warning
│ Cost: ₱30 × 5 = ₱150               │
│                                    │
│ ⚠️ Only 1 bundle can be made       │
└────────────────────────────────────┘
```

```
┌────────────────────────────────────┐
│ 📦 Product D                       │
│ Quantity: 3 units                  │
│ Stock: 0 units ❌ OUT OF STOCK     │  ← Red error
│ Cost: ₱40 × 3 = ₱120               │
│                                    │
│ ❌ Cannot make any bundles          │
└────────────────────────────────────┘
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (Wide)
```
┌─────────────────────────────────────────────────────┐
│ Two columns:                                        │
│ ┌──────────────┐  ┌──────────────┐                 │
│ │ Left Column  │  │ Right Column │                 │
│ │ - Name       │  │ - Category   │                 │
│ │ - SKU        │  │ - Channel    │                 │
│ └──────────────┘  └──────────────┘                 │
│                                                     │
│ Components: Full width, 2 per row                   │
└─────────────────────────────────────────────────────┘
```

### Mobile (Narrow)
```
┌──────────────────┐
│ Single column:   │
│ - Name           │
│ - Category       │
│ - Channel        │
│ - Store          │
│ - SKU            │
│                  │
│ Components:      │
│ 1 per row        │
│ Stacked          │
└──────────────────┘
```

---

## 🎨 ACTUAL COLORS

```css
/* Bundle Badge */
background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)
color: white

/* Component Cards */
background: slate-50 (light) / slate-800 (dark)
border: slate-200 (light) / slate-700 (dark)
hover: border-blue-300

/* Profit Margin */
>30%: bg-green-100, text-green-800
15-30%: bg-amber-100, text-amber-800
<15%: bg-red-100, text-red-800

/* Stock Warnings */
Low Stock: bg-yellow-50, border-yellow-300
Out of Stock: bg-red-50, border-red-300
```

---

## 🚀 FEATURES SUMMARY

✅ Clean, enterprise-grade design
✅ Matches your existing UI style
✅ Shows all bundle components
✅ Real-time stock calculations
✅ Color-coded warnings
✅ Responsive layout
✅ Editable fields clearly marked
✅ Read-only fields disabled
✅ Visual feedback on hover
✅ Professional spacing and typography

---

## 💡 GUSTO MO BA GAWIN KO?

Kung gusto mo, i-implement ko yan ngayon! 🚀
