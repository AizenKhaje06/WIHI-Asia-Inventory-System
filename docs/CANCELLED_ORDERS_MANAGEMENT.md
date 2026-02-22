# Cancelled Orders Management System

## Overview
Enterprise-grade cancelled orders tracking and management system with comprehensive customer information and analytics.

## Features

### 1. Customer Information Capture
When cancelling a transaction, the system now captures:
- ✅ Full Name
- ✅ Contact Number (Phone)
- ✅ Email Address
- ✅ Physical Address
- ✅ Cancellation Reason
- ✅ Cancelled By (Staff Name)
- ✅ Cancellation Timestamp

### 2. Dedicated Cancelled Orders Page
**Location:** Dashboard → Cancelled Orders

**Features:**
- Real-time statistics dashboard
- Advanced filtering system
- Export to CSV functionality
- Detailed transaction viewer
- Analytics and insights

### 3. Statistics Dashboard
The page displays:
- Total cancelled orders count
- Total value lost (potential revenue)
- Top cancellation reason
- Average order value
- Cancellation rate percentage

### 4. Advanced Filters
Filter cancelled orders by:
- Search (Transaction ID, Customer Name, Item Name)
- Cancellation Reason
- Staff Member
- Date Range
- Customer Information

### 5. Detailed Transaction View
Click "View Details" on any cancelled order to see:

**Transaction Information:**
- Transaction ID
- Cancellation date and time
- Original order date

**Customer Information:**
- Full name
- Contact number
- Email address
- Physical address

**Order Details:**
- Item name
- Quantity
- Unit price
- Total amount

**Cancellation Information:**
- Reason for cancellation
- Staff who processed cancellation
- Additional notes

### 6. Analytics & Insights
- Top 5 cancellation reasons with percentages
- Cancellation trends
- Recommendations based on patterns
- High cancellation rate alerts

### 7. Export Functionality
Export cancelled orders data to CSV including:
- Transaction ID
- Date & Time
- Item details
- Customer information
- Amount
- Cancellation reason
- Staff name

## Database Schema

### New Fields in `transactions` Table:
```sql
customer_phone VARCHAR(50)      -- Customer contact number
customer_email VARCHAR(255)     -- Customer email
customer_address TEXT           -- Customer physical address
```

### Existing Cancellation Fields:
```sql
status VARCHAR(20)              -- 'cancelled' for cancelled orders
cancellation_reason TEXT        -- Reason for cancellation
cancelled_by VARCHAR(100)       -- Staff who cancelled
cancelled_at TIMESTAMP          -- When it was cancelled
```

## Usage Guide

### For Staff (Cancelling Orders):
1. Go to Transaction History
2. Find the transaction to cancel
3. Click "Cancel Order"
4. Fill in:
   - Customer Name
   - Contact Number
   - Email (optional)
   - Address (optional)
   - Cancellation Reason
5. Confirm cancellation

### For Admins (Viewing Cancelled Orders):
1. Navigate to Dashboard → Cancelled Orders
2. Use filters to find specific orders
3. Click "View Details" for complete information
4. Export data for reporting
5. Review analytics for insights

## Benefits

### Business Intelligence:
- Identify patterns in cancellations
- Understand customer pain points
- Track staff performance
- Measure cancellation impact on revenue

### Customer Service:
- Complete customer contact information
- Easy follow-up for refunds
- Customer history tracking
- Better dispute resolution

### Compliance & Audit:
- Complete audit trail
- Staff accountability
- Timestamp tracking
- Reason documentation

### Operational Efficiency:
- Quick search and filtering
- Export for external analysis
- Real-time statistics
- Automated insights

## Best Practices

1. **Always Collect Customer Information:**
   - Minimum: Name + Phone
   - Recommended: Name + Phone + Email
   - Ideal: All fields including address

2. **Document Cancellation Reasons:**
   - Be specific and clear
   - Use consistent terminology
   - Add notes for context

3. **Regular Review:**
   - Check analytics weekly
   - Address top cancellation reasons
   - Train staff on common issues

4. **Follow-up Process:**
   - Contact customers for feedback
   - Resolve issues promptly
   - Track resolution outcomes

## Integration Points

### With Existing Systems:
- ✅ Transaction History
- ✅ Activity Logs
- ✅ Dashboard Statistics
- ✅ Customer Management (future)
- ✅ Refund Processing (future)

### Sidebar Navigation:
- Badge shows count of cancelled orders
- Red badge for visibility
- Auto-updates every 30 seconds

## Future Enhancements

### Planned Features:
- [ ] Refund status tracking
- [ ] Customer cancellation history
- [ ] Automated email notifications
- [ ] Approval workflow for high-value cancellations
- [ ] Integration with customer database
- [ ] SMS notifications
- [ ] Cancellation prevention suggestions
- [ ] Predictive analytics

## Technical Details

### API Endpoints:
- `GET /api/logs` - Fetch all transactions (filter by status='cancelled')
- `POST /api/logs/cancel` - Cancel a transaction

### Components:
- `app/dashboard/cancelled-orders/page.tsx` - Main page
- `components/premium-sidebar.tsx` - Navigation with badge

### Database Migration:
- `supabase/migrations/011_add_customer_details_to_transactions.sql`

## Support

For issues or questions:
1. Check Activity Logs for transaction history
2. Review this documentation
3. Contact system administrator

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Status:** ✅ Production Ready
