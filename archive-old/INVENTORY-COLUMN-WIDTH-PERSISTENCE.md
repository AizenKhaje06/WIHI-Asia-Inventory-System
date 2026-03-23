# Inventory Table Column Width Persistence

## Summary
Naka-save na ngayon yung column width adjustments sa inventory table. Kahit mag-refresh, mag-close ng browser, o mag-switch ng tab, yung adjustments mo ay naka-preserve na.

## Changes Made

**File**: `app/dashboard/inventory/page.tsx`

### 1. Load Saved Widths on Mount
```typescript
const [columnWidths, setColumnWidths] = useState(() => {
  // Try to load from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('inventory-column-widths')
    if (saved) {
      return JSON.parse(saved)
    }
  }
  // Default widths kung walang saved
  return { product: 319, category: 175, ... }
})
```

### 2. Save Widths After Resize
```typescript
const handleMouseUp = () => {
  if (resizing) {
    // Save to localStorage pag tapos na mag-resize
    localStorage.setItem('inventory-column-widths', JSON.stringify(columnWidths))
  }
  setResizing(null)
}
```

## How It Works

1. **First Load**: Gumagamit ng default column widths
2. **Adjust Column**: Drag yung column border para mag-resize
3. **Auto-Save**: Pag binitawan mo yung mouse, automatic na nag-save sa localStorage
4. **Reload/Reopen**: Pag bumalik ka, yung last adjustment mo ay naka-load na

## Storage Location

- **Key**: `inventory-column-widths`
- **Storage**: Browser localStorage (per-device, per-browser)
- **Format**: JSON object with column names and widths

## Example Saved Data
```json
{
  "product": 400,
  "category": 200,
  "status": 96,
  "stock": 96,
  "salesChannel": 150,
  "store": 180,
  "cost": 120,
  "price": 120,
  "margin": 110,
  "actions": 150
}
```

## Reset to Default

Kung gusto mo bumalik sa default widths:
1. Open browser console (F12)
2. Type: `localStorage.removeItem('inventory-column-widths')`
3. Refresh page

## Notes

- Persistent per browser/device (hindi shared across devices)
- Minimum column width: 80px
- Nag-save lang pag nag-resize, hindi sa bawat mouse move (for performance)
- Safe error handling kung may corrupt data sa localStorage
