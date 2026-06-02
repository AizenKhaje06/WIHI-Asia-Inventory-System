# Packer Dashboard Fixes

## Date: May 31, 2026
## Commit: bc11bd7

---

## Issue 1: Mobile View Table Text Wrapping

### Problem
- ORDER ID column showing vertically stacked characters instead of horizontal text
- Text breaking incorrectly in various columns on mobile devices
- Admin product page table worked fine, but packer dashboard had issues

### Root Cause
- Table columns were using `break-all` and `break-words` classes
- The ORDER ID (waybill) column specifically used `break-all` which caused character-by-character wrapping
- Missing `whitespace-nowrap` on critical columns

### Solution
Fixed the following columns in the packer dashboard table:

1. **Customer Name Column**
   - Changed from: `block break-words`
   - Changed to: `whitespace-nowrap`

2. **Contact Number Column**
   - Changed from: `block break-words`
   - Changed to: `whitespace-nowrap`

3. **Price Column**
   - Added: `whitespace-nowrap`

4. **Tracking/Waybill Column**
   - Changed from: `block break-all`
   - Changed to: `whitespace-nowrap`
   - Also added `whitespace-nowrap` to CANCELLED badge and courier text

5. **Items Column**
   - Changed from: `block break-words`
   - Changed to: normal display
   - Added `whitespace-nowrap` to quantity text

### Result
- ORDER ID now displays horizontally on mobile
- All columns maintain proper text formatting
- Table is now scrollable horizontally on mobile (as intended)
- Matches the behavior of admin product page table

---

## Issue 2: Cancellation Voice Notification Not Working

### Problem
- User cancelled an order from Facebook account
- No voice notification played in packer account
- Audio files existed and were correctly named
- Detection logic was implemented but not triggering

### Root Cause
The cancellation detection logic had a critical flaw:

```typescript
// OLD CODE - Only checked for ID/length changes
if (prevIds !== newIds || prev.length !== newQueue.length) {
  // Cancellation detection code here...
}
```

**The Issue:**
- When an order is cancelled, the order ID doesn't change
- The array length doesn't change
- Only the `is_cancelled` field changes from `false` to `true`
- Therefore, the condition was never true, and cancellation detection never ran!

### Solution
Added a check for cancellation status changes:

```typescript
// NEW CODE - Also checks for cancellation status changes
const prevOrderMap = new Map(prev.map(o => [o.id, o]))

// Check if any order's cancellation status changed
let hasCancellationChange = false
newQueue.forEach((order: Order) => {
  const prevOrder = prevOrderMap.get(order.id)
  if (prevOrder && prevOrder.is_cancelled !== order.is_cancelled) {
    hasCancellationChange = true
  }
})

// Now includes hasCancellationChange in the condition
if (prevIds !== newIds || prev.length !== newQueue.length || hasCancellationChange) {
  // Cancellation detection code runs properly now!
}
```

### How It Works Now
1. Creates a map of previous orders with their cancellation status
2. Checks each order in the new queue against the previous state
3. Detects if `is_cancelled` changed from `false` to `true`
4. Sets `hasCancellationChange` flag if any order was cancelled
5. Triggers the detection logic when cancellation status changes
6. Plays voice notification: "Order cancelled from [Channel]"
7. Sends push notification if enabled and app is in background

### Result
- Cancellation voice notifications now work correctly
- When any department cancels an order, packer hears the notification
- Debug logs show proper detection in browser console
- Push notifications also work for cancellations

---

## Testing Instructions

### Test Mobile View Fix:
1. Open packer dashboard on mobile device or mobile viewport
2. Check that ORDER ID displays horizontally (not vertically stacked)
3. Verify all columns display properly without text breaking issues
4. Confirm table is horizontally scrollable

### Test Cancellation Voice Notification:
1. Open packer dashboard in one browser tab
2. Open a department account (e.g., Facebook) in another tab
3. Create a new order from the department account
4. Wait for voice notification in packer dashboard: "New order from Facebook"
5. Cancel the order from the department account
6. Verify voice notification plays in packer dashboard: "Order cancelled from Facebook"
7. Check browser console for debug logs:
   - `[Cancellation Check]` - Shows comparison of previous vs current state
   - `[Cancellation Detected!]` - Confirms detection triggered
   - `[Voice] Playing cancellation audio for: Facebook` - Confirms audio playback

---

## Files Modified
- `app/packer/dashboard/page.tsx`

## Related Audio Files
- `public/sounds/order-cancelled-shopee.mp3`
- `public/sounds/order-cancelled-lazada.mp3`
- `public/sounds/order-cancelled-tiktok.mp3`
- `public/sounds/order-cancelled-facebook.mp3`
- `public/sounds/order-cancelled-physical-store.mp3`

---

## Notes
- Both fixes are backward compatible
- No database changes required
- No API changes required
- Works for both admin and department accounts
- Voice notifications respect the voice toggle button (green = on, gray = off)
- Push notifications respect the push toggle button (blue = on, gray = off)
