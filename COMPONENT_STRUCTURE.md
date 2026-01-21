# Premium UI Component Structure

## Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYOUT                            │
│  ┌────────────┬──────────────────────────────────────────┐  │
│  │            │         PREMIUM NAVBAR (72px)            │  │
│  │            │  ┌────────────────────────────────────┐  │  │
│  │            │  │ Search | Theme | Notif | Profile  │  │  │
│  │            │  └────────────────────────────────────┘  │  │
│  │  PREMIUM   ├──────────────────────────────────────────┤  │
│  │  SIDEBAR   │                                          │  │
│  │  (280px)   │          MAIN CONTENT AREA               │  │
│  │            │                                          │  │
│  │  ┌──────┐  │  ┌────────────────────────────────┐    │  │
│  │  │ Logo │  │  │  Page Header                   │    │  │
│  │  └──────┘  │  │  - Title                       │    │  │
│  │            │  │  - Description                 │    │  │
│  │  Nav Items │  └────────────────────────────────┘    │  │
│  │  ┌──────┐  │                                          │  │
│  │  │ Main │  │  ┌────────────────────────────────┐    │  │
│  │  │ Inv  │  │  │  Stat Cards (Grid)             │    │  │
│  │  │ Ins  │  │  │  ┌──────┬──────┬──────┬──────┐ │    │  │
│  │  │ CRM  │  │  │  │ Card │ Card │ Card │ Card │ │    │  │
│  │  │ Ops  │  │  │  └──────┴──────┴──────┴──────┘ │    │  │
│  │  └──────┘  │  └────────────────────────────────┘    │  │
│  │            │                                          │  │
│  │  ┌──────┐  │  ┌────────────────────────────────┐    │  │
│  │  │Logout│  │  │  Charts / Tables / Content     │    │  │
│  │  └──────┘  │  │                                │    │  │
│  │            │  └────────────────────────────────┘    │  │
│  └────────────┴──────────────────────────────────────────┤  │
│                                                           │  │
└───────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Premium Sidebar (`components/premium-sidebar.tsx`)

```typescript
<PremiumSidebar>
  ├── Logo & Brand Section (72px height)
  │   ├── Icon Badge (Warehouse)
  │   ├── Brand Name (STOCKIFY)
  │   └── Collapse Toggle Button
  │
  ├── Navigation Sections
  │   ├── Main Section
  │   │   ├── Dashboard
  │   │   ├── Point of Sales
  │   │   └── Transactions
  │   │
  │   ├── Inventory Section
  │   │   ├── Products
  │   │   ├── Low Stocks
  │   │   └── Out of Stocks
  │   │
  │   ├── Insights Section
  │   │   ├── Sales Analytics
  │   │   └── Business Insights
  │   │
  │   ├── CRM Section
  │   │   └── Customers
  │   │
  │   └── Operations Section
  │       └── Logs
  │
  └── Logout Button (Bottom)
```

**Features:**
- Collapsible (280px ↔ 80px)
- Active state indicator (left border)
- Hover effects
- Smooth transitions
- Icon + label layout

---

### 2. Premium Navbar (`components/premium-navbar.tsx`)

```typescript
<PremiumNavbar>
  ├── Left Section
  │   ├── Mobile Menu Button (< 1024px)
  │   └── Global Search Input
  │       ├── Search Icon
  │       └── Placeholder Text
  │
  └── Right Section
      ├── Theme Toggle Button
      │   └── Sun/Moon Icon
      │
      ├── Notifications Dropdown
      │   ├── Bell Icon + Badge
      │   └── Dropdown Menu
      │       ├── Notification 1
      │       ├── Notification 2
      │       └── ...
      │
      ├── Settings Button
      │   └── Settings Icon
      │
      └── User Profile Dropdown
          ├── Avatar + Name + Role
          └── Dropdown Menu
              ├── Profile Settings
              ├── Preferences
              ├── Help & Support
              └── Logout
```

**Features:**
- Glass morphism effect
- Focus animations on search
- Notification badge
- Theme switching
- User menu

---

### 3. Premium Loading (`components/premium-loading.tsx`)

```typescript
<PremiumDashboardLoading>
  ├── Header Skeleton
  │   ├── Title Skeleton (h-10 w-80)
  │   └── Description Skeleton (h-5 w-96)
  │
  ├── Chart Card Skeleton
  │   ├── Card Header Skeleton
  │   └── Chart Area Skeleton (h-[350px])
  │
  ├── Stat Cards Grid Skeleton (4 cards)
  │   └── Card × 4
  │       ├── Label Skeleton
  │       └── Value Skeleton
  │
  └── Content Cards Grid Skeleton (3 cards)
      └── Card × 3
          ├── Header Skeleton
          └── Content Rows × 4

<PremiumTableLoading>
  ├── Header Skeleton
  ├── Stat Cards Grid Skeleton (4 cards)
  ├── Search Bar Skeleton
  └── Table Skeleton
      └── Rows × 8
```

**Features:**
- Shimmer animation
- Proper sizing
- Smooth fade-in
- Context-aware layouts

---

## Page Structures

### Dashboard Page

```typescript
<DashboardPage>
  ├── Page Header
  │   ├── Title: "Executive Dashboard"
  │   └── Description
  │
  ├── Sales & Purchase Chart Card
  │   ├── Card Header (Title + Time Period Tabs)
  │   └── Area Chart (Recharts)
  │
  ├── Stat Cards Grid (4 columns)
  │   ├── Total Stocks Value (Blue gradient)
  │   ├── Total Revenue (Purple gradient)
  │   ├── Total Cost (Orange gradient)
  │   └── Profit Margin (Green gradient)
  │
  ├── Info Cards Grid (3 columns)
  │   ├── Top Performing Products
  │   ├── Stock Warning (Low Stock)
  │   └── Recent Transactions
  │
  └── Charts Grid (2 columns)
      ├── Stock Count by Storage Room (Bar Chart)
      └── Stocks Count by Category (Bar Chart)
```

---

### Customers Page

```typescript
<CustomersPage>
  ├── Page Header
  │   ├── Title: "Customer Management"
  │   └── Description
  │
  ├── Stat Cards Grid (4 columns)
  │   ├── Total Customers (Blue)
  │   ├── VIP Customers (Purple)
  │   ├── Total Revenue (Green)
  │   └── Avg. Spent (Orange)
  │
  ├── Search & Add Card
  │   ├── Search Input (with icon)
  │   └── Add Customer Button
  │
  ├── Customers Table Card
  │   ├── Table Header
  │   └── Table Body
  │       └── Customer Rows
  │           ├── Name
  │           ├── Contact (Email + Phone)
  │           ├── Tier Badge
  │           ├── Loyalty Points
  │           ├── Total Purchases
  │           └── Total Spent
  │
  └── Add Customer Dialog
      └── Form Fields
```

---

### Inventory Page

```typescript
<InventoryPage>
  ├── Page Header
  │   ├── Title: "Inventory Management"
  │   └── Description
  │
  ├── Filters & Actions Card
  │   ├── Search Input
  │   ├── Category Filter Dropdown
  │   ├── Price Filter Dropdown
  │   ├── Storage Room Filter Dropdown
  │   └── Add Product Button
  │
  ├── Products Table Card
  │   ├── Table Header
  │   └── Table Body
  │       └── Product Rows
  │           ├── Product Name
  │           ├── Category
  │           ├── Stock Quantity
  │           ├── Total COGS
  │           ├── Cost Price
  │           ├── Selling Price
  │           └── Actions (Restock, Edit, Delete)
  │
  ├── Add Item Dialog
  ├── Edit Item Dialog
  └── Restock Dialog
```

---

### Insights Page

```typescript
<InsightsPage>
  ├── Page Header
  │   ├── Title: "Business Insights"
  │   └── Description
  │
  ├── Tabs Navigation
  │   ├── ABC Analysis
  │   ├── Inventory Turnover
  │   ├── Sales Forecast
  │   ├── Profit Margins
  │   └── Dead Stock
  │
  └── Tab Content (Dynamic)
      ├── Charts (Pie, Bar, Line)
      └── Data Tables
```

---

## Design System Classes

### Card Styles
```css
.card-premium              /* Standard card with shadow */
.card-premium-elevated     /* Elevated card with larger shadow */
.stat-card                 /* Gradient stat card */
```

### Button Styles
```css
.btn-premium               /* Base button */
.btn-primary               /* Primary action button */
.btn-secondary             /* Secondary button */
.btn-ghost                 /* Ghost button */
```

### Input Styles
```css
.input-premium             /* Standard input field */
```

### Table Styles
```css
.table-premium             /* Premium table */
.table-premium.table-striped    /* Striped rows */
.table-premium.table-compact    /* Compact spacing */
```

### Badge Styles
```css
.badge-premium             /* Base badge */
.badge-success             /* Success badge */
.badge-warning             /* Warning badge */
.badge-error               /* Error badge */
.badge-info                /* Info badge */
```

### Utility Classes
```css
.animate-fade-in           /* Fade in animation */
.animate-slide-in          /* Slide in animation */
.animate-scale-in          /* Scale in animation */
.animate-shimmer           /* Shimmer loading */
.glass                     /* Glass morphism */
.gradient-text             /* Gradient text */
.skeleton                  /* Loading skeleton */
```

---

## Color Variables

### Light Mode
```css
--background: #ffffff
--foreground: #171717
--primary-600: #2563eb
--border: #e5e5e5
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### Dark Mode
```css
--background: #0a0a0a
--foreground: #fafafa
--primary-600: #2563eb
--border: #262626
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5)
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  - Sidebar collapses to hamburger menu
  - Stat cards stack vertically
  - Tables scroll horizontally
  - Font sizes reduce
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  - 2-column grid for stat cards
  - Sidebar remains visible
  - Optimized chart sizes
}

/* Desktop */
@media (min-width: 1024px) {
  - Full layout with sidebar
  - 4-column grid for stat cards
  - Optimal spacing
}
```

---

## Animation Timings

```css
--transition-fast: 150ms    /* Hover states */
--transition-base: 200ms    /* Standard interactions */
--transition-slow: 300ms    /* Complex animations */
--transition-bounce: 500ms  /* Attention effects */
```

---

## Z-Index Layers

```css
z-50: Sidebar
z-40: Navbar
z-30: Modals/Dialogs
z-20: Dropdowns
z-10: Tooltips
z-0:  Content
```

---

This structure ensures a **consistent, maintainable, and scalable** component architecture for the premium corporate UI.
