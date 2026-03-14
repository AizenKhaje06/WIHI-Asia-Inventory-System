# Warehouse Transfer Feature - Complete Implementation

## Overview
The warehouse transfer feature allows users to move inventory items between different stores/locations within the system.

## How It Works

### 1. **Access Point**
- Navigate to **Dashboard → Internal Usage Management**
- Click the **"Dispatch Items"** button

### 2. **Dispatch Modal - Three Options**

#### Option A: Demo/Display
- **Purpose**: Demo/Display
- **Sales Channel**: Select where the demo will be displayed (Facebook, TikTok, Lazada, Shopee, Physical Store)
- **Items**: Add products to cart
- **Result**: Items deducted from warehouse inventory, logged as demo activity

#### Option B: Internal Use
- **Purpose**: Internal Use
- **Sales Channel**: Select which channel/department will use the items
- **Items**: Add products to cart
- **Result**: Items deducted from warehouse inventory, logged as internal consumption

#### Option C: Warehouse Transfer ⭐ (NEW)
- **Purpose**: Warehouse Transfer
- **Destination Sales Channel & Store**: Select where items should be transferred to:
  - 🏭 Warehouse (Main)
  - 📘 Facebook Store
  - 🎵 TikTok Shop
  - 🛒 Lazada
  - 🛍️ Shopee
  - 🏪 Physical Store
- **Items**: Add products to cart
  - Products already in destination are automatically hidden
  - Each product shows its current Sales Channel and Store
- **Result**: Items moved from source store to destination store

### 3. **Transfer Process**

When you select "Warehouse Transfer":

1. **Select Destination Store** - Choose where items are going
2. **Add Items to Cart** - Select products and quantities
3. **Review Cart** - Verify items and quantities
4. **Dispatch** - Click "Dispatch (X items)" button
5. **Success** - Get confirmation with Dispatch ID

### 4. **Backend Logic**

The API (`/api/sales`) handles warehouse transfers intelligently:

**If destination item exists:**
- Deducts quantity from source store
- Adds quantity to destination store
- Creates transfer log

**If destination item doesn't exist:**
- Deducts quantity from source store
- Creates new inventory entry in destination store
- Creates transfer log

### 5. **Data Tracking**

Each warehouse transfer is recorded with:
- ✓ Source store (where items came from)
- ✓ Destination store (where items went)
- ✓ Item name and quantity
- ✓ Cost price (for valuation)
- ✓ Staff name (who performed transfer)
- ✓ Timestamp
- ✓ Optional notes

### 6. **Viewing Transfers**

In the Internal Usage page:
- **Overview Tab**: See total transfer cost and count
- **Cost Analysis Tab**: View transfer costs as percentage of total
- **Transaction History Tab**: Filter by "Warehouse Transfer" to see all transfers
- **Sales Channels Tab**: View breakdown by destination

## Key Features

✅ **Automatic Inventory Sync** - Source and destination inventory updated simultaneously
✅ **Cost Tracking** - All transfers logged with cost values for financial reporting
✅ **Audit Trail** - Complete history of who transferred what, when, and where
✅ **Flexible Destinations** - Transfer to any store or sales channel location
✅ **Smart Handling** - Creates new inventory entries if needed
✅ **Real-time Updates** - Dashboard and inventory pages update immediately

## Example Scenarios

### Scenario 1: Restock Physical Store from Warehouse
1. Purpose: **Warehouse Transfer**
2. Destination: **Physical Store**
3. Items: 50x Berry Soap, 30x Build Cord
4. Result: Items moved from Warehouse to Physical Store inventory

### Scenario 2: Transfer Between Sales Channels
1. Purpose: **Warehouse Transfer**
2. Destination: **Lazada**
3. Items: 100x Bundle 10, 50x Bundle 12
4. Result: Items moved from current location to Lazada inventory

### Scenario 3: Consolidate to Main Warehouse
1. Purpose: **Warehouse Transfer**
2. Destination: **Warehouse**
3. Items: All items from various channels
4. Result: Centralize inventory back to main warehouse

## Technical Details

**API Endpoint**: `POST /api/sales`

**Request Format**:
```json
{
  "items": [
    { "itemId": "item-123", "quantity": 50 },
    { "itemId": "item-456", "quantity": 30 }
  ],
  "department": "Warehouse Transfer / Physical Store",
  "staffName": "John Doe",
  "notes": "Monthly restock"
}
```

**Response**:
```json
{
  "transactions": [
    {
      "id": "txn-123",
      "itemName": "Berry Soap",
      "quantity": 50,
      "transactionType": "transfer",
      "department": "Warehouse Transfer / Physical Store"
    }
  ]
}
```

## Files Modified

- `app/dashboard/internal-usage/page.tsx` - Added destination store field and logic
- `app/api/sales/route.ts` - Already supports warehouse transfer (no changes needed)

## Status

✅ **COMPLETE** - Warehouse transfer feature fully implemented and tested
- Build verified successful
- All diagnostics passing
- Ready for production use
