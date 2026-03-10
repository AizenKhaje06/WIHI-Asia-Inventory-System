# Team Leader Dashboard - Visual Guide

## 🎨 User Interface Overview

### Login Page
```
┌─────────────────────────────────────────┐
│                                         │
│         TEAM LEADER LOGIN               │
│                                         │
│  Select your channel and enter password │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Sales Channel                   │   │
│  │ ┌─────────────────────────────┐ │   │
│  │ │ Warehouse Admin ▼           │ │   │
│  │ │ - Warehouse Admin           │ │   │
│  │ │ - TikTok                    │ │   │
│  │ │ - Shopee                    │ │   │
│  │ │ - Facebook                  │ │   │
│  │ │ - Lazada                    │ │   │
│  │ └─────────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Password                        │   │
│  │ ┌─────────────────────────────┐ │   │
│  │ │ ••••••••••                  │ │   │
│  │ └─────────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔐 LOGIN                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Need help? Contact your administrator │
│                                         │
└─────────────────────────────────────────┘
```

### Dashboard Page
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 DASHBOARD                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📦 TOTAL     │  │ ✅ COMPLETED │  │ ⏳ PENDING   │     │
│  │ ORDERS       │  │ ORDERS       │  │ ORDERS       │     │
│  │              │  │              │  │              │     │
│  │ 45           │  │ 32           │  │ 13           │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💰 TOTAL REVENUE                                    │  │
│  │                                                      │  │
│  │ ₱125,450.00                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  (Real-time updates every 5 seconds)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Track Orders Page
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 TRACK ORDERS                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Search: ┌──────────────────────────────────────────────┐  │
│          │ Search by order number or customer name...  │  │
│          └──────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Order # │ Customer │ Amount │ Status │ Date        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ORD-001 │ John Doe │ ₱1,500 │ Pending│ 2026-03-10 │   │
│  │ ORD-002 │ Jane Doe │ ₱2,500 │ Packed │ 2026-03-09 │   │
│  │ ORD-003 │ Bob Smith│ ₱3,000 │ Shipped│ 2026-03-08 │   │
│  │ ORD-004 │ Alice J. │ ₱1,200 │ Pending│ 2026-03-10 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 1-4 of 45 orders                                  │
│  < Previous  1  2  3  4  5  Next >                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Packing Queue Page
```
┌─────────────────────────────────────────────────────────────┐
│ 📮 PACKING QUEUE                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Order: ORD-001                                      │   │
│  │ Customer: John Doe                                  │   │
│  │ Items: 3                                            │   │
│  │ Total: ₱1,500.00                                    │   │
│  │                                                     │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ 📦 PACK                                      │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Order: ORD-004                                      │   │
│  │ Customer: Alice J.                                  │   │
│  │ Items: 2                                            │   │
│  │ Total: ₱1,200.00                                    │   │
│  │                                                     │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ 📦 PACK                                      │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 2 pending orders                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dispatch Page
```
┌─────────────────────────────────────────────────────────────┐
│ 🚚 DISPATCH                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Order: ORD-002                                      │   │
│  │ Customer: Jane Doe                                  │   │
│  │ Items: 5                                            │   │
│  │ Total: ₱2,500.00                                    │   │
│  │                                                     │   │
│  │ Courier: ┌──────────────────────────────────────┐  │   │
│  │          │ Select Courier...                   │  │   │
│  │          └──────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │ Tracking: ┌──────────────────────────────────────┐ │   │
│  │           │ Enter tracking number...            │ │   │
│  │           └──────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ 🚚 DISPATCH                                  │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 1 packed order ready for dispatch                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Inventory Alerts Page
```
┌─────────────────────────────────────────────────────────────┐
│ 🚨 INVENTORY ALERTS                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Product: T-Shirt (Blue)                             │   │
│  │ Current Stock: 5 units                              │   │
│  │ Min Threshold: 10 units                             │   │
│  │ Severity: 🔴 CRITICAL                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Product: Jeans (Black)                              │   │
│  │ Current Stock: 15 units                             │   │
│  │ Min Threshold: 20 units                             │   │
│  │ Severity: 🟡 LOW                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Product: Shoes (White)                              │   │
│  │ Current Stock: 8 units                              │   │
│  │ Min Threshold: 10 units                             │   │
│  │ Severity: 🟡 LOW                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 3 alerts for Warehouse Admin channel              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Settings Page
```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ SETTINGS                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER INFORMATION                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Username: tl_warehouse_001                          │   │
│  │ Display Name: Team Lead - Warehouse                 │   │
│  │ Email: warehouse@local.test                         │   │
│  │ Channel: Warehouse Admin                            │   │
│  │ Role: team_leader                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CHANGE PASSWORD                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Current Password:                                   │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ ••••••••••                                   │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │ New Password:                                       │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ ••••••••••                                   │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │ Confirm Password:                                   │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ ••••••••••                                   │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │ ┌──────────────────────────────────────────────┐   │   │
│  │ │ 💾 SAVE CHANGES                             │   │   │
│  │ └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Navigation
```
┌──────────────────────┐
│ 🏢 TEAM LEADER       │
│ Warehouse Admin      │
├──────────────────────┤
│ 📊 Dashboard         │
│ 📋 Track Orders      │
│ 📮 Packing Queue     │
│ 🚚 Dispatch          │
│ 🚨 Inventory Alerts  │
│ ⚙️ Settings          │
├──────────────────────┤
│ 🚪 Logout            │
└──────────────────────┘
```

---

## 🎯 User Flows

### Login Flow
```
Start
  ↓
User navigates to /team-leader-login
  ↓
Page loads with channel dropdown
  ↓
User selects channel (e.g., "Warehouse Admin")
  ↓
User enters password
  ↓
User clicks "Login"
  ↓
Frontend sends POST /api/auth/team-leader-login
  ↓
Backend verifies credentials
  ↓
✅ Valid → Session stored → Redirect to dashboard
❌ Invalid → Show error message → Stay on login
```

### Order Packing Flow
```
Start
  ↓
User navigates to /team-leader/packing-queue
  ↓
Page displays pending orders
  ↓
User clicks "Pack" button on order
  ↓
Confirmation dialog appears
  ↓
User clicks "Confirm"
  ↓
Frontend sends POST /api/team-leader/packing-queue/[id]/pack
  ↓
Backend updates order status to "packed"
  ↓
✅ Success → Order removed from queue → Show success toast
❌ Error → Show error message → Order stays in queue
```

### Order Dispatch Flow
```
Start
  ↓
User navigates to /team-leader/dispatch
  ↓
Page displays packed orders
  ↓
User selects courier from dropdown
  ↓
User enters tracking number
  ↓
User clicks "Dispatch" button
  ↓
Confirmation dialog appears
  ↓
User clicks "Confirm"
  ↓
Frontend sends POST /api/team-leader/dispatch/[id]/dispatch
  ↓
Backend updates order status to "dispatched"
  ↓
✅ Success → Order removed from queue → Show success toast
❌ Error → Show error message → Order stays in queue
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Login Page                                                 │
│  ├─ Channel Dropdown                                        │
│  └─ Password Input                                          │
│         ↓                                                   │
│  Dashboard                                                  │
│  ├─ KPI Cards                                               │
│  └─ Real-time Updates (every 5 seconds)                     │
│         ↓                                                   │
│  Track Orders / Packing / Dispatch / Alerts                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
                    localStorage
                    (Session Data)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/auth/team-leader-login                           │
│  GET /api/team-leader/dashboard/kpis                        │
│  GET /api/team-leader/orders                                │
│  POST /api/team-leader/packing-queue/[id]/pack              │
│  POST /api/team-leader/dispatch/[id]/dispatch               │
│  GET /api/team-leader/inventory-alerts                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
                    Middleware
                    (Auth Check)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  users (with assigned_channel)                              │
│  orders (with sales_channel)                                │
│  inventory_alerts (with sales_channel)                      │
│  dispatch_tracking                                          │
│                                                             │
│  All queries filtered by:                                   │
│  WHERE sales_channel = user.assigned_channel                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Status Colors
- 🟢 **Green** - Completed, Success
- 🟡 **Yellow/Orange** - Pending, Warning
- 🔴 **Red** - Critical, Error
- 🔵 **Blue** - Info, Primary

### Severity Levels
- 🟡 **LOW** - Yellow badge
- 🔴 **CRITICAL** - Red badge

### Button Colors
- 🟠 **Orange Gradient** - Primary actions (Login, Pack, Dispatch)
- ⚪ **Gray** - Secondary actions (Cancel)
- 🔴 **Red** - Destructive actions (Delete, Logout)

---

## 📱 Responsive Design

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (200px) │ Main Content (remaining)              │
│                 │                                       │
│ Navigation      │ Dashboard / Pages                     │
│ Links           │ Full width content                    │
│                 │ Multiple columns                      │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (150px) │ Main Content (remaining)              │
│                 │                                       │
│ Collapsed Nav   │ Dashboard / Pages                     │
│ Icons only      │ Adjusted width content                │
│                 │ Single column                         │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────────────────────────────────────┐
│ ☰ Menu │ Main Content (full width)                      │
│        │                                                │
│ Drawer │ Dashboard / Pages                              │
│ Nav    │ Full width content                             │
│        │ Single column                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔔 Toast Notifications

### Success Toast
```
┌─────────────────────────────────────────┐
│ ✅ Login successful                     │
│ (Auto-dismiss after 3 seconds)          │
└─────────────────────────────────────────┘
```

### Error Toast
```
┌─────────────────────────────────────────┐
│ ❌ Invalid channel or credentials       │
│ (Auto-dismiss after 5 seconds)          │
└─────────────────────────────────────────┘
```

### Info Toast
```
┌─────────────────────────────────────────┐
│ ℹ️ Order marked as packed               │
│ (Auto-dismiss after 3 seconds)          │
└─────────────────────────────────────────┘
```

---

## 🎯 Confirmation Modals

### Logout Confirmation
```
┌─────────────────────────────────────────┐
│ ⚠️ Confirm Logout                       │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to log out?       │
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Cancel       │  │ Logout       │    │
│ └──────────────┘  └──────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Pack Confirmation
```
┌─────────────────────────────────────────┐
│ ✓ Confirm Pack                          │
├─────────────────────────────────────────┤
│                                         │
│ Mark order ORD-001 as packed?           │
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Cancel       │  │ Confirm      │    │
│ └──────────────┘  └──────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 KPI Card Layout

```
┌──────────────────────────────────────┐
│ 📦 TOTAL ORDERS                      │
│                                      │
│ 45                                   │
│                                      │
│ +5 from yesterday                    │
└──────────────────────────────────────┘
```

---

## 🎓 Legend

| Icon | Meaning |
|------|---------|
| 📊 | Dashboard |
| 📋 | Orders/List |
| 📮 | Packing |
| 🚚 | Dispatch/Shipping |
| 🚨 | Alerts/Warnings |
| ⚙️ | Settings |
| 🚪 | Logout |
| ✅ | Success/Completed |
| ⏳ | Pending |
| 🔴 | Critical/Error |
| 🟡 | Warning/Low |
| 🟢 | Good/Normal |

---

**Visual Guide Version: 1.0**
**Last Updated: March 10, 2026**
