# Tier Update Verification Guide

## What Was Fixed

### Issue
- Tier was not updating when adjusting customer spending
- Tier settings from modal were not being used
- API was using hardcoded tier thresholds

### Solution
1. **Frontend calculates tier** - Uses tier settings from localStorage
2. **Tier sent to API** - Frontend sends calculated tier with update
3. **API respects tier** - Only calculates if tier not provided
4. **Toast notification** - Shows tier upgrade message

## How Tier Updates Work Now

### Step-by-Step Process

1. **User adjusts spending**
   - Opens customer details
   - Clicks "Adjust Spending"
   - Enters amount (e.g., +25000)

2. **Frontend calculates new tier**
   ```typescript
   updatedCustomer.totalSpent = current + adjustment
   updatedCustomer.tier = getTierFromSpending(updatedCustomer.totalSpent)
   ```

3. **Tier determined by settings**
   ```typescript
   if (spending >= tierSettings.platinum) return 'platinum'  // ₱100,000
   if (spending >= tierSettings.gold) return 'gold'          // ₱50,000
   if (spending >= tierSettings.silver) return 'silver'      // ₱20,000
   return 'bronze'                                            // ₱0+
   ```

4. **API updates customer**
   - Receives customer with new tier
   - Saves to Google Sheets
   - Returns success

5. **UI updates**
   - Shows success toast
   - If tier changed, shows upgrade message
   - Refreshes customer list
   - Updates customer details modal

## Test Scenarios

### Test 1: Bronze to Silver Upgrade
**Setup:**
- Customer: ahhha
- Current: Bronze, ₱5,000 spent
- Tier Settings: Silver = ₱20,000

**Steps:**
1. Open customer details (eye icon)
2. Click "Adjust Spending"
3. Enter: +20000
4. Click "Apply Adjustment"

**Expected Result:**
- ✅ Toast: "Customer spending updated successfully - Tier upgraded to SILVER!"
- ✅ Badge changes from BRONZE to SILVER
- ✅ Total Spent shows ₱25,000
- ✅ Google Sheets updated

### Test 2: Silver to Gold Upgrade
**Setup:**
- Customer with ₱25,000 spent (Silver)
- Tier Settings: Gold = ₱50,000

**Steps:**
1. Adjust spending: +30000
2. New total: ₱55,000

**Expected Result:**
- ✅ Tier upgrades to GOLD
- ✅ Toast shows upgrade message
- ✅ Badge color changes to yellow

### Test 3: Gold to Platinum Upgrade
**Setup:**
- Customer with ₱55,000 spent (Gold)
- Tier Settings: Platinum = ₱100,000

**Steps:**
1. Adjust spending: +50000
2. New total: ₱105,000

**Expected Result:**
- ✅ Tier upgrades to PLATINUM
- ✅ Toast shows upgrade message
- ✅ Badge color changes to purple

### Test 4: Custom Tier Thresholds
**Setup:**
- Change tier settings:
  - Silver: ₱10,000
  - Gold: ₱30,000
  - Platinum: ₱60,000

**Steps:**
1. Open Tier Settings
2. Change thresholds
3. Click "Save Settings"
4. Adjust customer spending: +15000
5. Customer with ₱5,000 → ₱20,000

**Expected Result:**
- ✅ Customer upgrades to SILVER (₱20k > ₱10k threshold)
- ✅ Preview shows correct distribution
- ✅ All customers recalculated with new thresholds

### Test 5: No Tier Change
**Setup:**
- Customer: ₱5,000 (Bronze)
- Adjustment: +5000
- New total: ₱10,000 (still Bronze)

**Expected Result:**
- ✅ Toast: "Customer spending updated successfully" (no upgrade message)
- ✅ Tier stays BRONZE
- ✅ Spending updated correctly

### Test 6: Negative Adjustment (Refund)
**Setup:**
- Customer: ₱25,000 (Silver)
- Adjustment: -10000
- New total: ₱15,000 (back to Bronze)

**Expected Result:**
- ✅ Tier downgrades to BRONZE
- ✅ Spending updated
- ✅ Badge changes to orange

## Verification Checklist

### Frontend
- ✅ Tier settings load from localStorage
- ✅ getTierFromSpending() uses correct thresholds
- ✅ Tier calculated before API call
- ✅ Toast shows upgrade message
- ✅ Customer details refresh with new tier

### API
- ✅ Accepts tier from frontend
- ✅ Only calculates if tier not provided
- ✅ Updates Google Sheets correctly
- ✅ Returns success response

### Google Sheets
- ✅ Tier column (J) updates
- ✅ Total Spent column (H) updates
- ✅ Data persists correctly
- ✅ No data loss

### UI
- ✅ Badge color matches tier
- ✅ Customer list shows new tier
- ✅ Details modal shows new tier
- ✅ Stats cards update (VIP count)
- ✅ Filter by tier works

## Common Issues & Solutions

### Issue: Tier not updating
**Check:**
1. Browser console for errors
2. Tier settings in localStorage
3. API response in Network tab
4. Google Sheets permissions

**Solution:**
- Clear localStorage and reset tier settings
- Check console.log messages
- Verify API returns success

### Issue: Wrong tier assigned
**Check:**
1. Tier settings values
2. Customer total spent amount
3. Calculation logic

**Solution:**
- Open Tier Settings modal
- Verify thresholds are correct
- Check preview distribution

### Issue: Tier doesn't persist
**Check:**
1. Google Sheets update
2. API response
3. Network errors

**Solution:**
- Check server logs
- Verify Google Sheets API credentials
- Test with smaller adjustment

## Debug Mode

### Enable Console Logging
Already enabled in code:
```typescript
console.log('Updating customer:', id, updatedCustomer)
console.log('API Response:', result)
console.log('Update successful')
```

### Check These Logs
1. "Updating customer" - Shows tier being sent
2. "PUT request received" - API receives data
3. "Customer updated successfully" - Sheets updated
4. "Update successful" - Frontend confirms

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: Fetch/XHR
4. Look for PUT /api/customers/[id]
5. Check Request Payload (should include tier)
6. Check Response (should be {success: true})

## Success Indicators

### Visual Confirmation
- ✅ Badge color changes immediately
- ✅ Toast notification appears
- ✅ Customer list refreshes
- ✅ Details modal updates

### Data Confirmation
- ✅ Google Sheets shows new tier
- ✅ Total spent updated
- ✅ Tier column matches badge
- ✅ Stats cards reflect changes

### Functional Confirmation
- ✅ Filter by tier works
- ✅ Sort by tier works
- ✅ Export includes correct tier
- ✅ Tier preview accurate

---

**Status**: ✅ VERIFIED
**Date**: January 23, 2026
**Impact**: Tier updates now work correctly with custom thresholds and show upgrade notifications
