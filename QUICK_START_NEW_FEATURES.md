# Quick Start Guide - New Features

## 🚀 What's New?

Three powerful feature sets have been added to Inventory Pro:

### 1. 💰 Customer Management (CRM)
- Track customers with loyalty points
- Automatic tier system (Bronze → Silver → Gold → Platinum)
- Purchase history and analytics
- **Access:** `/dashboard/customers`

### 2. 🧠 Advanced Analytics
- **ABC Analysis** - Prioritize inventory (80/20 rule)
- **Inventory Turnover** - Identify fast/slow-moving items
- **Sales Forecasting** - AI-powered demand prediction
- **Profit Margins** - Category performance analysis
- **Dead Stock** - Find items to discount/remove
- **Access:** `/dashboard/analytics`

### 3. 📱 Offline Mode
- Works without internet connection
- Auto-syncs when back online
- Real-time sync status indicator
- **Automatic** - No setup needed!

---

## 📦 Installation Steps

### 1. Install Dependencies
```bash
npm install date-fns
# or
pnpm install date-fns
```

### 2. Google Sheets Setup
Add a new sheet named **"Customers"** with these columns:
```
ID | Name | Email | Phone | Address | Loyalty Points | Total Purchases | Total Spent | Last Purchase | Tier | Created At
```

### 3. Deploy
```bash
npm run build
npm start
```

That's it! All features are ready to use.

---

## 🎯 Quick Usage

### Customer Management
1. Click **"Customers"** in sidebar
2. Click **"Add Customer"** button
3. Fill in customer details
4. Customer automatically gets Bronze tier
5. Tier upgrades as they spend more:
   - Silver: ₱20,000+
   - Gold: ₱50,000+
   - Platinum: ₱100,000+

### Advanced Analytics
1. Click **"Advanced Analytics"** in sidebar
2. Choose a tab:
   - **ABC Analysis**: See which products drive 80% of revenue
   - **Inventory Turnover**: Find fast/slow-moving items
   - **Sales Forecast**: Get AI predictions for reordering
   - **Profit Margins**: See which categories are most profitable
   - **Dead Stock**: Identify items to discount

### Offline Mode
1. **Automatic!** Just use the app normally
2. When offline, a notification appears
3. Make changes as usual
4. Changes sync automatically when back online
5. Click "Sync" button to force sync

---

## 🎨 New Navigation

Updated sidebar with new sections:

```
📊 Dashboard
🛒 Point of Sales
📈 Transactions
───────────────
📦 Products
⚠️  Low Stocks
❌ Out of Stocks
───────────────
📊 Sales Analytics
🧠 Advanced Analytics  ← NEW!
───────────────
👥 Customers           ← NEW!
───────────────
📝 Logs
```

---

## 💡 Pro Tips

### Customer Management
- **Loyalty Points**: Customers earn 1 point per ₱100 spent
- **Tier Benefits**: Use tiers for targeted promotions
- **Search**: Search by name, email, or phone

### Analytics
- **ABC Analysis**: Focus on "A" items - they're your money makers
- **Dead Stock**: Items with no sales in 90+ days
- **Forecasting**: Requires at least 3 sales to predict
- **Confidence Score**: Higher = more reliable prediction

### Offline Mode
- **Storage Limit**: ~50MB in browser
- **Sync Queue**: Unlimited pending operations
- **Auto-Sync**: Happens when you reconnect
- **Manual Sync**: Click sync button anytime

---

## 📊 Example Scenarios

### Scenario 1: VIP Customer Program
```
1. Go to Customers page
2. Filter by "Platinum" tier
3. Export list (coming soon)
4. Send exclusive offers
```

### Scenario 2: Optimize Inventory
```
1. Go to Advanced Analytics
2. Check ABC Analysis
3. Focus on "A" items (high revenue)
4. Consider removing "C" items in Dead Stock
```

### Scenario 3: Prevent Stockouts
```
1. Go to Advanced Analytics
2. Check Sales Forecast tab
3. See "Recommended Reorder" column
4. Order before predicted stockout
```

### Scenario 4: Field Inventory Count
```
1. Take tablet/phone to warehouse
2. App works offline automatically
3. Update quantities as you count
4. Sync when back to WiFi
```

---

## 🔧 Customization

### Change Customer Tiers
Edit `lib/customer-management.ts`:
```typescript
export async function calculateCustomerTier(totalSpent: number) {
  if (totalSpent >= 100000) return 'platinum'  // Change amounts
  if (totalSpent >= 50000) return 'gold'
  if (totalSpent >= 20000) return 'silver'
  return 'bronze'
}
```

### Change Loyalty Points Rate
Edit `lib/customer-management.ts`:
```typescript
const points = Math.floor(amount / 100)  // 1 point per 100
// Change to: amount / 50 for 1 point per 50
```

### Change Dead Stock Threshold
Edit analytics call:
```typescript
identifyDeadStock(items, transactions, 90)  // 90 days
// Change to: 60 for 60 days
```

---

## 🐛 Troubleshooting

### "Customer sheet not found"
- Create "Customers" sheet in Google Sheets
- Add the column headers exactly as shown above

### Analytics not loading
- Need at least 3 sales transactions for forecasting
- Check browser console for errors

### Offline mode not working
- Requires HTTPS (works on localhost)
- Check browser supports IndexedDB
- Clear browser cache and reload

### Sync failing
- Check internet connection
- Check Google Sheets API limits (100 req/100s)
- Try manual sync button

---

## 📈 Performance Tips

1. **Analytics**: Runs calculations client-side, may take 2-3 seconds for large datasets
2. **Offline Storage**: Stores last 1000 items locally
3. **Sync**: Processes 100 operations per batch
4. **Caching**: Analytics cached for 5 minutes

---

## 🎓 Learn More

- **Full Documentation**: See `NEW_FEATURES_DOCUMENTATION.md`
- **Implementation Plan**: See `FEATURE_IMPLEMENTATION_PLAN.md`
- **API Reference**: Check `/app/api/` folders

---

## ✅ Feature Checklist

After installation, verify:

- [ ] Customers page loads
- [ ] Can create new customer
- [ ] Customer tier shows correctly
- [ ] Advanced Analytics page loads
- [ ] ABC Analysis displays
- [ ] Offline indicator appears when offline
- [ ] Sync works when back online

---

## 🎉 You're Ready!

All features are now active. Start by:
1. Adding a few customers
2. Checking the analytics dashboard
3. Testing offline mode

Enjoy your enhanced Inventory Pro! 🚀
