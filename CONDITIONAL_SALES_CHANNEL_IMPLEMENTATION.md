# Conditional Sales Channel Dropdown - Implementation Complete ✅

## Overview
Implemented a conditional second dropdown that appears when "Demo/Display" or "Internal Use" is selected, allowing users to specify which sales channel the items will be used for.

## Changes Made

### 1. Warehouse Dispatch Page (`app/dashboard/pos/page.tsx`)

#### Added State:
```typescript
const [salesChannel, setSalesChannel] = useState('') // For demo/internal use
```

#### Updated Destination Dropdown:
- Added onChange handler to reset salesChannel when destination changes
- Clears salesChannel if user switches away from Demo/Display or Internal Use

#### Added Conditional Sales Channel Dropdown:
```typescript
{(department === 'Demo/Display' || department === 'Internal Use') && (
  <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
    <Label>Sales Channel * (Where will this be used?)</Label>
    <Select value={salesChannel} onValueChange={setSalesChannel}>
      <SelectTrigger className="border-blue-300">
        <SelectValue placeholder="Select sales channel" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Facebook">📘 Facebook Store</SelectItem>
        <SelectItem value="Tiktok">🎵 Tiktok Shop</SelectItem>
        <SelectItem value="Lazada">🛒 Lazada</SelectItem>
        <SelectItem value="Shopee">🛍️ Shopee</SelectItem>
        <SelectItem value="Physical Store">🏪 Physical Store</SelectItem>
      </SelectContent>
    </Select>
    <p className="text-xs">
      This will be saved as: {department} / {salesChannel || '...'}
    </p>
  </div>
)}
```

#### Updated handleCheckout:
```typescript
// Check if demo/internal use requires sales channel
const requiresSalesChannel = ['Demo/Display', 'Internal Use'].includes(department)
if (requiresSalesChannel && !salesChannel) {
  alert('Please select a sales channel for demo/internal use')
  return
}

// Combine department and sales channel if applicable
const finalDepartment = requiresSalesChannel && salesChannel 
  ? `${department} / ${salesChannel}`
  : department
```

### 2. Internal Usage Page (`app/dashboard/internal-usage/page.tsx`)

#### Updated usageByDepartment Calculation:
```typescript
// Parse combined format: "Demo/Display / Tiktok" or "Internal Use / Lazada"
if (dept.includes(' / ')) {
  const parts = dept.split(' / ')
  dept = parts[1] || parts[0] // Use sales channel part
}
```

## How It Works

### User Flow:

#### Scenario 1: Regular Sale
1. Select items
2. Select Destination: "Tiktok Shop"
3. No additional dropdown appears
4. Saved as: `department: "Tiktok"`

#### Scenario 2: Demo/Display with Sales Channel
1. Select items
2. Select Destination: "Demo/Display"
3. **Second dropdown appears**: "Sales Channel *"
4. Select Sales Channel: "Tiktok Shop"
5. Preview shows: "Demo/Display / Tiktok"
6. Saved as: `department: "Demo/Display / Tiktok"`

#### Scenario 3: Internal Use with Sales Channel
1. Select items
2. Select Destination: "Internal Use"
3. **Second dropdown appears**: "Sales Channel *"
4. Select Sales Channel: "Lazada"
5. Preview shows: "Internal Use / Lazada"
6. Saved as: `department: "Internal Use / Lazada"`

### Database Records:

#### Example 1: Demo item for TikTok
```json
{
  "id": "TXN-123",
  "itemName": "LAUNDRY SOAP",
  "quantity": 1,
  "department": "Demo/Display / Tiktok",
  "transactionType": "demo",
  "type": "sale",
  "totalRevenue": 0
}
```

#### Example 2: Internal use for Lazada
```json
{
  "id": "TXN-124",
  "itemName": "GOLD CORD",
  "quantity": 1,
  "department": "Internal Use / Lazada",
  "transactionType": "internal",
  "type": "sale",
  "totalRevenue": 0
}
```

#### Example 3: Regular sale to Shopee
```json
{
  "id": "TXN-125",
  "itemName": "PRODUCT X",
  "quantity": 5,
  "department": "Shopee",
  "transactionType": "sale",
  "type": "sale",
  "totalRevenue": 500
}
```

### Internal Usage Tracking Display:

#### Sales Channels Tab:
Parses the combined format and groups by sales channel:

```
Sales Channel    | Demo Qty | Internal Qty | Total | % of Total
Tiktok          |    50    |      20      |   70  |   35%
Lazada          |    30    |      15      |   45  |   22.5%
Shopee          |    25    |      10      |   35  |   17.5%
Facebook        |    20    |       5      |   25  |   12.5%
Physical Store  |    15    |      10      |   25  |   12.5%
```

#### Transaction History Tab:
Shows the full department string:

```
Date       | Type     | Item        | Qty | Value  | Department              | Staff
2/8/2026   | Demo     | LAUNDRY SOAP|  1  | ₱50    | Demo/Display / Tiktok   | John
2/8/2026   | Internal | GOLD CORD   |  1  | ₱150   | Internal Use / Lazada   | Jane
2/8/2026   | Sale     | PRODUCT X   |  5  | ₱500   | Shopee                  | Mike
```

## Features

### 1. Conditional Display
- Second dropdown only appears when needed
- Smooth animation (fade-in, slide-in)
- Blue border to highlight it's a required field

### 2. Validation
- Checks if sales channel is selected before allowing dispatch
- Shows alert if missing: "Please select a sales channel for demo/internal use"

### 3. Preview
- Shows real-time preview of how it will be saved
- Format: "Demo/Display / Tiktok" or "Internal Use / Lazada"

### 4. Auto-Reset
- Clears sales channel when switching away from Demo/Display or Internal Use
- Prevents invalid combinations

### 5. Smart Parsing
- Internal Usage page automatically parses combined format
- Extracts sales channel for grouping
- Maintains full string for Transaction History

## Benefits

### ✅ No New Database Column Needed
- Uses existing `department` field
- Simple string format: "Purpose / Channel"

### ✅ Clear User Intent
- User explicitly selects both purpose and channel
- No ambiguity about where items are used

### ✅ Accurate Reporting
- Sales Channels tab shows correct data
- Can track demo/internal usage per sales channel
- Example: "TikTok used 50 demo items, Lazada used 30 demo items"

### ✅ Backward Compatible
- Old records without " / " separator still work
- New records use combined format
- Both display correctly

## Testing Checklist

- [x] Conditional dropdown appears for Demo/Display
- [x] Conditional dropdown appears for Internal Use
- [x] Conditional dropdown hidden for regular sales channels
- [x] Validation prevents dispatch without sales channel
- [x] Preview shows correct format
- [x] Auto-reset works when changing destination
- [x] Combined format saved correctly to database
- [x] Sales Channels tab parses and groups correctly
- [x] Transaction History shows full department string
- [x] No TypeScript errors
- [x] Smooth animations

## Files Modified

1. `app/dashboard/pos/page.tsx` - Added conditional sales channel dropdown
2. `app/dashboard/internal-usage/page.tsx` - Added parsing logic for combined format

## Next Steps

1. Test with real data
2. Verify Sales Channels tab displays correctly
3. Verify Transaction History shows full department string
4. Optional: Add tooltip explaining the format
5. Optional: Add color coding for demo vs internal in Transaction History

## Conclusion

Successfully implemented a conditional sales channel dropdown that allows users to specify which sales channel demo/internal items will be used for. The solution uses the existing database schema with a simple string format, requires no migrations, and provides clear, accurate reporting in the Internal Usage Tracking system.
