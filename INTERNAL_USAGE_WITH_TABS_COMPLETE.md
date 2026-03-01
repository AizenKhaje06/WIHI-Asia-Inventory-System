# Internal Usage - With Tabs Design ✅

## Overview
Redesigned Internal Usage page with **4 tabs** similar to the screenshot provided: Overview, Sales Channels, Cost Analysis, and Transaction History.

## Tab Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Internal Usage                          [Dispatch Items Button]│
│  Track items for demo displays, internal use, and warehouse...  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [Overview] [Sales Channels] [Cost Analysis] [Transaction History]│
└─────────────────────────────────────────────────────────────────┘

[Tab Content Here]
```

## Tabs

### 1. Overview Tab
**Purpose**: Dashboard view with key metrics and recent transactions

**Content**:
- **4 Stats Cards**:
  - Total Cost (all internal usage)
  - Demo/Display Cost + transaction count
  - Internal Use Cost + transaction count
  - Warehouse Transfer Cost + transaction count

- **Recent Transactions** (last 5):
  - Item name with avatar
  - Department and date
  - Cost and quantity

### 2. Sales Channels Tab
**Purpose**: Breakdown by sales channel (Facebook, TikTok, Lazada, Shopee, Physical Store)

**Content**:
- **Sales Channel Breakdown**:
  - Channel name
  - Transaction count
  - Total cost
  - Progress bar showing percentage of total

**Note**: Only shows channels that have been used (from Demo/Display or Internal Use with sales channel)

### 3. Cost Analysis Tab
**Purpose**: Detailed cost breakdown by type

**Content**:
- **3 Stats Cards**:
  - Demo/Display Cost + percentage of total
  - Internal Use Cost + percentage of total
  - Transfer Cost + percentage of total

- **Cost by Type** (visual bars):
  - Demo/Display (amber bar)
  - Internal Use (blue bar)
  - Warehouse Transfer (indigo bar)
  - Each with cost amount and progress bar

### 4. Transaction History Tab
**Purpose**: Full table of all internal usage transactions

**Content**:
- **Search and Filter**:
  - Search by item, department, or staff
  - Filter by type (All, Demo, Internal, Transfer)

- **Transactions Table**:
  - Date & time
  - Item name
  - Type badge (color-coded)
  - Department
  - Quantity badge
  - Cost
  - Staff (with avatar)
  - Notes

## Features

### Tab Navigation
- **Active Tab**: Purple-to-blue gradient background with white text
- **Inactive Tab**: Default styling
- **Icons**: Each tab has an icon (PieChart, BarChart3, TrendingUp, Calendar)
- **Responsive**: 4-column grid on desktop, stacks on mobile

### Dispatch Button
- **Location**: Top-right corner (always visible)
- **Style**: Purple-to-blue gradient
- **Icon**: Plus icon
- **Action**: Opens dispatch modal

### Dispatch Modal
- Same as before
- 2-column layout
- Purpose, Sales Channel, Notes, Dispatched By
- Product grid
- Cart summary

### Success Modal
- Same as before
- Dispatch ID
- Item breakdown
- Confirmation messages

## Analytics Calculations

### Total Cost
```typescript
const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0)
```

### By Type
```typescript
const demoTransactions = transactions.filter(t => t.transactionType === 'demo')
const internalTransactions = transactions.filter(t => t.transactionType === 'internal')
const transferTransactions = transactions.filter(t => t.transactionType === 'transfer')

const demoCost = demoTransactions.reduce((sum, t) => sum + t.totalCost, 0)
const internalCost = internalTransactions.reduce((sum, t) => sum + t.totalCost, 0)
const transferCost = transferTransactions.reduce((sum, t) => sum + t.totalCost, 0)
```

### By Sales Channel
```typescript
const salesChannelData = transactions.reduce((acc, t) => {
  if (t.department && (t.transactionType === 'demo' || t.transactionType === 'internal')) {
    const parts = t.department.split(' / ')
    if (parts.length > 1) {
      const channel = parts[1]
      if (!acc[channel]) {
        acc[channel] = { count: 0, cost: 0 }
      }
      acc[channel].count++
      acc[channel].cost += t.totalCost
    }
  }
  return acc
}, {} as Record<string, { count: number, cost: number }>)
```

## Color Scheme

### Type Colors
- **Demo/Display**: Amber (#F59E0B)
- **Internal Use**: Blue (#3B82F6)
- **Warehouse Transfer**: Indigo (#6366F1)

### Tab Active State
- **Background**: Purple-to-blue gradient
- **Text**: White

### Progress Bars
- **Sales Channels**: Purple-to-blue gradient
- **Cost Analysis**: Type-specific colors (amber, blue, indigo)

## Responsive Design

### Desktop (lg+)
- 4-column tab grid
- 4-column stats cards (Overview)
- 3-column stats cards (Cost Analysis)
- Full table width

### Tablet (md)
- 4-column tab grid (may wrap)
- 2-column stats cards
- Full table width with scroll

### Mobile (sm)
- Stacked tabs
- 1-column stats cards
- Table with horizontal scroll

## Empty States

### Sales Channels Tab
- Shows when no sales channel data available
- BarChart3 icon
- Message: "No sales channel data available"

### Transaction History Tab
- Shows when no transactions found
- Package icon
- Message: "No internal usage records found"
- Hint: "Click 'Dispatch Items' to create a new record"

## Files Modified

- ✅ `app/dashboard/internal-usage/page.tsx` - Complete redesign with tabs
- ✅ `app/api/internal-usage/route.ts` - API endpoint (already created)

## Advantages

### ✅ Better Organization
- Data separated into logical tabs
- Easy to find specific information
- Clean, uncluttered interface

### ✅ Analytics Dashboard
- Overview tab provides quick insights
- Sales channel breakdown
- Cost analysis with visual bars

### ✅ Familiar Pattern
- Similar to Insights page
- Consistent with app design
- Users know how to navigate

### ✅ Professional Look
- Enterprise-grade UI
- Color-coded types
- Visual progress bars
- Gradient active states

## Summary

The Internal Usage page now has **4 tabs** (Overview, Sales Channels, Cost Analysis, Transaction History) with a **Dispatch Items button** that opens a modal. The design matches the screenshot provided and follows the same pattern as the Insights page.

**Key Features**:
- 📊 Overview dashboard with stats
- 📈 Sales channel breakdown
- 💰 Cost analysis with visual bars
- 📋 Full transaction history table
- ➕ Dispatch button (always visible)
- 🎨 Enterprise-grade UI with gradients

**Status**: ✅ COMPLETE AND READY FOR TESTING
