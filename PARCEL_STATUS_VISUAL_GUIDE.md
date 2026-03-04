# Parcel Status Cards - Visual Guide

## Ano ang Makikita Mo

### Location
Makikita mo ang Parcel Status cards sa **Sales Channel Detail Page**:
1. Go to **Dashboard → Sales Channels**
2. Click on any channel (e.g., Shopee, Lazada, TikTok)
3. Scroll down after the main metrics cards
4. Makikita mo ang **"Parcel Status Overview"** section

## Card Designs

### 1. Pending Card (Amber/Yellow)
```
┌─────────────────────────┐
│ 📦  [Pending Badge]     │
│                         │
│        25               │ ← Big number
│   Awaiting Dispatch     │ ← Description
└─────────────────────────┘
```
- **Color**: Amber gradient (yellow-orange)
- **Meaning**: Orders na hindi pa na-dispatch
- **Action**: Kailangan i-pack at i-ship

### 2. In Transit Card (Blue)
```
┌─────────────────────────┐
│ 📈  [In Transit Badge]  │
│                         │
│        15               │
│    On the Way           │
└─────────────────────────┘
```
- **Color**: Blue gradient
- **Meaning**: Orders na nasa delivery na
- **Action**: Hinihintay ang delivery

### 3. Delivered Card (Green)
```
┌─────────────────────────┐
│ 🛒  [Delivered Badge]   │
│                         │
│        60               │
│ Successfully Delivered  │
└─────────────────────────┘
```
- **Color**: Green gradient
- **Meaning**: Successfully delivered orders
- **Action**: Completed! ✅

### 4. Total Card (Gray) with Delivery Rate
```
┌─────────────────────────┐
│ 📦  [Total Badge]       │
│                         │
│       100               │
│   All Parcels           │
│ ─────────────────────   │
│ Delivery Rate: 60.0%    │ ← Percentage
└─────────────────────────┘
```
- **Color**: Slate/Gray gradient
- **Meaning**: Total lahat ng orders
- **Special**: May delivery rate calculation
- **Formula**: (Delivered ÷ Total) × 100%

## Responsive Layout

### Desktop (4 columns)
```
┌─────────┬─────────┬─────────┬─────────┐
│ Pending │In Transit│Delivered│  Total  │
└─────────┴─────────┴─────────┴─────────┘
```

### Tablet (2 columns)
```
┌─────────┬─────────┐
│ Pending │In Transit│
├─────────┼─────────┤
│Delivered│  Total  │
└─────────┴─────────┘
```

### Mobile (1 column)
```
┌─────────┐
│ Pending │
├─────────┤
│In Transit│
├─────────┤
│Delivered│
├─────────┤
│  Total  │
└─────────┘
```

## Dark Mode

### Light Mode Colors
- Pending: Amber-50 to Amber-100 background
- In Transit: Blue-50 to Blue-100 background
- Delivered: Green-50 to Green-100 background
- Total: Slate-50 to Slate-100 background

### Dark Mode Colors
- Pending: Amber-900/20 to Amber-800/20 background
- In Transit: Blue-900/20 to Blue-800/20 background
- Delivered: Green-900/20 to Green-800/20 background
- Total: Slate-800/50 to Slate-700/50 background

## Example Scenarios

### Scenario 1: Busy Day
```
Pending: 45      ← Maraming pending!
In Transit: 30   ← Marami ring on the way
Delivered: 125   ← Good delivery rate
Total: 200
Delivery Rate: 62.5%
```
**Action**: Dagdagan ang packing staff

### Scenario 2: Smooth Operations
```
Pending: 5       ← Konti lang pending
In Transit: 10   ← Manageable
Delivered: 85    ← Excellent!
Total: 100
Delivery Rate: 85.0%
```
**Action**: Maintain current operations

### Scenario 3: Delivery Issues
```
Pending: 10      ← OK lang
In Transit: 60   ← Sobrang dami stuck in transit!
Delivered: 30    ← Mababa ang delivered
Total: 100
Delivery Rate: 30.0%
```
**Action**: Check courier issues, contact logistics

## How to Use

### For Operations Manager
1. **Morning Check**: Tingnan ang pending count
2. **Allocate Resources**: Kung mataas ang pending, dagdagan ang staff
3. **Monitor Transit**: Check kung normal ang in-transit count
4. **Track Delivery Rate**: Target at least 80% delivery rate

### For Warehouse Staff
1. **Priority Check**: Tingnan kung aling channel may pinaka-maraming pending
2. **Pack Orders**: Focus sa channel na may highest pending
3. **Update Status**: Mark as packed para mag-move sa in-transit

### For Customer Service
1. **Quick Reference**: Check order status per channel
2. **Customer Inquiries**: Makikita agad kung pending, in-transit, or delivered
3. **Issue Resolution**: Kung mataas ang in-transit, may possible delay

## Date Filter Integration

### How It Works
```
[Start Date] [End Date] [Apply Filter]
        ↓
Updates all metrics including parcel status
```

### Example
- **Filter**: Feb 1 - Feb 28, 2026
- **Result**: Shows parcel status for orders within that date range
- **Use Case**: Monthly performance review

## Delivery Rate Interpretation

### Excellent (80-100%)
```
Delivery Rate: 85.0% ✅
```
- Operations running smoothly
- Good courier performance
- Happy customers

### Good (60-79%)
```
Delivery Rate: 70.0% ⚠️
```
- Acceptable but can improve
- Monitor for issues
- Check courier performance

### Needs Attention (Below 60%)
```
Delivery Rate: 45.0% ❌
```
- Serious delivery issues
- Investigate immediately
- Contact courier/logistics
- Review packing process

## Tips for Best Results

### 1. Regular Monitoring
- Check every morning
- Review before end of day
- Weekly trend analysis

### 2. Set Targets
- Pending: Keep below 20% of total
- In Transit: Should move to delivered within 3-5 days
- Delivered: Target 80%+ delivery rate

### 3. Take Action
- High pending → Add packing staff
- High in-transit → Check courier
- Low delivered → Investigate delays

### 4. Compare Channels
- Which channel has best delivery rate?
- Which channel needs improvement?
- Learn from best performers

## Common Questions

### Q: Bakit walang parcel status cards?
**A**: Possible reasons:
- Walang orders sa selected date range
- Orders table not accessible
- Sales channel name mismatch

### Q: Bakit zero lahat?
**A**: 
- Check date range filter
- Verify may orders sa channel
- Try expanding date range

### Q: Paano mag-update ang counts?
**A**:
- Automatic update every 2 minutes (cache)
- Manual update: Change date filter and click Apply
- Real-time: Refresh page

### Q: Pwede ba i-click ang cards?
**A**: 
- Currently display-only
- Future: Click to see order details
- Future: Export parcel status report

## Integration with Other Features

### Works With
- ✅ Date range filters
- ✅ Sales channel filtering
- ✅ Dark mode
- ✅ Responsive design
- ✅ Export reports (future)

### Complements
- Main metrics cards (Revenue, Profit, etc.)
- Cash flow chart
- Store breakdown
- Recent transactions

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│ PARCEL STATUS QUICK REFERENCE           │
├─────────────────────────────────────────┤
│ 🟡 Pending    → Need to pack & ship     │
│ 🔵 In Transit → Currently delivering    │
│ 🟢 Delivered  → Successfully completed  │
│ ⚪ Total      → All orders + rate       │
├─────────────────────────────────────────┤
│ TARGET METRICS:                         │
│ • Pending: < 20% of total               │
│ • Delivery Rate: > 80%                  │
│ • In Transit: Move to delivered in 3-5d │
└─────────────────────────────────────────┘
```

**Enjoy your new parcel tracking feature!** 🚀📦
