# Cancelled Orders Tracking Feature
## Implementation Guide & Documentation

---

## 📋 Overview

This feature adds comprehensive tracking for cancelled, returned, and pending transactions across the inventory system. It provides visibility into order cancellations, helps identify operational issues, and tracks revenue impact.

---

## 🗄️ Database Schema Changes

### New Columns Added to `logs` Table

```sql
status VARCHAR(20) DEFAULT 'completed'
  -- Possible values: 'completed', 'cancelled', 'returned', 'pending'
  -- Default: 'completed' for backward compatibility

cancellation_reason TEXT
  -- Free text or predefined reasons:
  -- - customer_request
  -- - out_of_stock
  -- - payment_failed
  -- - duplicate_order
  -- - pricing_error
  -- - quality_issue
  -- - delivery_issue
  -- - other

cancelled_by VARCHAR(100)
  -- Staff member name who cancelled the transaction

cancelled_at TIMESTAMP WITH TIME ZONE
  -- Exact timestamp when cancellation occurred
```

### Indexes Created
```sql
idx_logs_status ON logs(status)
  -- Fast filtering by status

idx_logs_cancelled_at ON logs(cancelled_at) WHERE cancelled_at IS NOT NULL
  -- Efficient queries for cancellation analytics
```

---

## 📊 Data Accuracy Considerations

### 1. Revenue Calculations
**IMPORTANT**: Cancelled orders should NOT be included in revenue calculations

```typescript
// ✅ CORRECT: Filter out cancelled orders
const totalRevenue = transactions
  .filter(t => t.status !== 'cancelled')
  .reduce((sum, t) => sum + t.totalRevenue, 0)

// ❌ WRONG: Including all transactions
const totalRevenue = transactions
  .reduce((sum, t) => sum + t.totalRevenue, 0)
```

### 2. Inventory Impact
**CRITICAL**: When cancelling an order, inventory must be restored

```typescript
// When cancelling a sale:
// 1. Mark transaction as cancelled
// 2. Add quantity back to inventory
// 3. Log the cancellation reason
// 4. Record who cancelled and when
```

### 3. Profit Calculations
Cancelled orders have ZERO profit impact:

```typescript
const totalProfit = transactions
  .filter(t => t.status === 'completed')
  .reduce((sum, t) => sum + t.profit, 0)
```

### 4. Cancellation Rate Formula
```typescript
const cancellationRate = (cancelledCount / totalOrders) * 100
// Industry standard: <5% is good, >10% needs attention
```

---

## 🎯 Key Metrics to Track

### 1. Cancellation Rate
```
Formula: (Cancelled Orders / Total Orders) × 100
Target: < 5%
Warning: > 10%
Critical: > 15%
```

### 2. Lost Revenue
```
Formula: Sum of totalRevenue for all cancelled orders
Impact: Direct revenue loss
```

### 3. Top Cancellation Reasons
```
Track frequency of each reason
Helps identify systemic issues
```

### 4. Cancellation Trends
```
Track cancellations over time
Identify patterns (day of week, time of day, specific products)
```

---

## 🎨 UI Components

### Status Badge Component
```tsx
function getStatusBadge(status: string) {
  const styles = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    returned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  
  const icons = {
    completed: '✅',
    cancelled: '❌',
    returned: '🔙',
    pending: '🔄',
  }
  
  return (
    <Badge className={styles[status]}>
      {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
```

### Cancellation Dialog
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Cancel Transaction</DialogTitle>
      <DialogDescription>
        This will cancel the transaction and restore inventory.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>Cancellation Reason</Label>
        <Select>
          <SelectItem value="customer_request">Customer Request</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          <SelectItem value="payment_failed">Payment Failed</SelectItem>
          <SelectItem value="duplicate_order">Duplicate Order</SelectItem>
          <SelectItem value="pricing_error">Pricing Error</SelectItem>
          <SelectItem value="quality_issue">Quality Issue</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </Select>
      </div>
      
      <div>
        <Label>Additional Notes (Optional)</Label>
        <Textarea placeholder="Provide more details..." />
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline">Keep Transaction</Button>
      <Button variant="destructive">Confirm Cancellation</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 📍 Where to Display Cancelled Data

### 1. Dashboard Page (Priority 1)
**Location**: Summary Cards Section

```tsx
<Card>
  <CardContent>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 rounded-[5px] bg-red-100 dark:bg-red-900/30">
        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      </div>
      <Badge className="bg-red-100 text-red-700">
        {cancellationRate.toFixed(1)}%
      </Badge>
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white">
      {totalCancelledOrders}
    </div>
    <div className="text-xs text-slate-600 dark:text-slate-400">
      Cancelled Orders
    </div>
    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
      Lost Revenue: {formatCurrency(cancelledOrdersValue)}
    </div>
  </CardContent>
</Card>
```

### 2. Reports Page (Priority 1)
**Location**: Transaction History Table

Add columns:
- Status badge
- Cancellation reason (if cancelled)
- Cancelled by (if cancelled)
- Cancelled at (if cancelled)

Add filters:
- Status dropdown (All, Completed, Cancelled, Returned, Pending)
- Date range for cancellations
- Cancellation reason filter

### 3. Business Insights Page (Priority 2)
**Location**: New "Cancellations" Tab

Show:
- Cancellation rate trend (line chart)
- Top cancelled products (bar chart)
- Cancellation reasons distribution (pie chart)
- Revenue lost over time (area chart)
- Peak cancellation times (heatmap)

### 4. Sales Analytics Page (Priority 2)
**Location**: Metrics Section

```tsx
<div className="grid grid-cols-3 gap-4">
  <div>
    <p className="text-sm text-slate-600">Gross Sales</p>
    <p className="text-2xl font-bold">{formatCurrency(grossSales)}</p>
  </div>
  <div>
    <p className="text-sm text-red-600">Cancelled</p>
    <p className="text-2xl font-bold text-red-600">
      -{formatCurrency(cancelledValue)}
    </p>
  </div>
  <div>
    <p className="text-sm text-green-600">Net Sales</p>
    <p className="text-2xl font-bold text-green-600">
      {formatCurrency(netSales)}
    </p>
  </div>
</div>
```

### 5. Sales Channels Page (Priority 3)
**Location**: Per-Channel Metrics

```tsx
<div className="text-xs text-slate-600 dark:text-slate-400">
  Cancellation Rate: {channelCancellationRate.toFixed(1)}%
  {channelCancellationRate > 10 && (
    <span className="text-red-600 ml-2">⚠️ High</span>
  )}
</div>
```

---

## 🔄 API Endpoints to Update

### 1. `/api/dashboard`
Add cancelled orders metrics:
```typescript
{
  totalCancelledOrders: number
  cancelledOrdersValue: number
  cancellationRate: number
  topCancellationReasons: { reason: string; count: number }[]
}
```

### 2. `/api/reports`
Filter transactions by status:
```typescript
// Query parameter: ?status=completed|cancelled|returned|pending
```

### 3. `/api/logs`
Support cancellation:
```typescript
POST /api/logs/cancel
{
  logId: string
  reason: string
  notes?: string
  staffName: string
}
```

---

## ✅ Testing Checklist

### Data Accuracy Tests
- [ ] Cancelled orders excluded from revenue calculations
- [ ] Inventory restored when order cancelled
- [ ] Cancellation rate calculated correctly
- [ ] Lost revenue tracked accurately
- [ ] Status filters work correctly

### UI/UX Tests
- [ ] Status badges display correctly
- [ ] Cancellation dialog works
- [ ] Filters update data properly
- [ ] Mobile responsive
- [ ] Dark mode compatible

### Edge Cases
- [ ] Cancel already cancelled order (should fail)
- [ ] Cancel with zero inventory (should still work)
- [ ] Cancel very old transaction
- [ ] Bulk cancellation
- [ ] Cancel and then restore

---

## 🚨 Important Warnings

### 1. Data Integrity
**NEVER** delete cancelled transactions. Always mark as cancelled and keep the record for audit purposes.

### 2. Inventory Sync
**ALWAYS** restore inventory when cancelling. Use database transactions to ensure atomicity.

### 3. Revenue Reports
**ALWAYS** filter out cancelled orders from revenue calculations. Include them only in cancellation-specific reports.

### 4. Historical Data
Existing transactions without status should default to 'completed'. The migration handles this automatically.

---

## 📈 Success Metrics

### Week 1
- [ ] All cancelled orders tracked
- [ ] Dashboard shows cancellation card
- [ ] Reports page has status filter

### Week 2
- [ ] Cancellation rate < 5%
- [ ] Top 3 cancellation reasons identified
- [ ] Action plan to reduce cancellations

### Month 1
- [ ] Cancellation trend analysis complete
- [ ] Process improvements implemented
- [ ] Measurable reduction in cancellation rate

---

## 🔧 Maintenance

### Monthly Review
- Review cancellation rate trends
- Analyze top cancellation reasons
- Identify problematic products/channels
- Update processes to reduce cancellations

### Quarterly Audit
- Verify data accuracy
- Check for anomalies
- Update cancellation reason categories
- Review staff cancellation patterns

---

## 📚 References

### Industry Standards
- E-commerce cancellation rate: 3-7%
- Retail cancellation rate: 1-3%
- B2B cancellation rate: 5-10%

### Best Practices
- Track cancellation reasons
- Make cancellation easy (reduces fraud)
- Analyze patterns regularly
- Set up alerts for high cancellation rates

---

**Last Updated**: 2026-02-22
**Version**: 1.0.0
**Status**: Implementation in Progress
