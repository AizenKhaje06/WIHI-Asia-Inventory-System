# Team Leader Dashboard - Testing Checklist

## 📋 Pre-Testing Setup

### Database Setup
- [ ] **Step 1: Fix Role Constraint**
  - [ ] Open Supabase SQL Editor
  - [ ] Run ALTER TABLE SQL
  - [ ] Verify: "Query executed successfully"
  - [ ] Time: 5 minutes

- [ ] **Step 2: Insert Test Data**
  - [ ] Open TEAM-LEADER-TEST-SETUP.sql
  - [ ] Copy INSERT statements
  - [ ] Paste into SQL Editor
  - [ ] Run all queries
  - [ ] Verify: 5 team leaders created
  - [ ] Time: 5 minutes

### Application Setup
- [ ] **Step 3: Start Dev Server**
  - [ ] Run: `npm run dev`
  - [ ] Verify: Server running on localhost:3000
  - [ ] Time: 1 minute

---

## 🔐 Authentication Testing

### Login Page
- [ ] **Navigate to Login Page**
  - [ ] Go to: `http://localhost:3000/team-leader-login`
  - [ ] Page loads successfully
  - [ ] Channel dropdown visible
  - [ ] Password input visible
  - [ ] Login button visible

### Test Login - Warehouse Admin
- [ ] **Select Channel**
  - [ ] Click channel dropdown
  - [ ] Select "Warehouse Admin (Physical Store)"
  - [ ] Channel selected in dropdown

- [ ] **Enter Password**
  - [ ] Click password field
  - [ ] Type: `2010404422`
  - [ ] Password masked with dots

- [ ] **Submit Login**
  - [ ] Click Login button
  - [ ] See loading spinner
  - [ ] See success toast: "Login successful"
  - [ ] Redirected to `/team-leader/dashboard`
  - [ ] Time: 2 minutes

### Test Login - Other Channels
- [ ] **TikTok Channel**
  - [ ] Logout
  - [ ] Select: TikTok
  - [ ] Password: `12345678`
  - [ ] Login successful

- [ ] **Shopee Channel**
  - [ ] Logout
  - [ ] Select: Shopee
  - [ ] Password: `2010404422`
  - [ ] Login successful

- [ ] **Facebook Channel**
  - [ ] Logout
  - [ ] Select: Facebook
  - [ ] Password: `12345678`
  - [ ] Login successful

- [ ] **Lazada Channel**
  - [ ] Logout
  - [ ] Select: Lazada
  - [ ] Password: `2010404422`
  - [ ] Login successful

### Test Invalid Login
- [ ] **Invalid Channel**
  - [ ] Select: Warehouse Admin
  - [ ] Password: `wrong_password`
  - [ ] See error: "Invalid channel or credentials"
  - [ ] Not redirected

- [ ] **Invalid Password**
  - [ ] Select: Warehouse Admin
  - [ ] Password: `wrong`
  - [ ] See error: "Invalid channel or credentials"
  - [ ] Not redirected

---

## 📊 Dashboard Testing

### Dashboard Page Load
- [ ] **Navigate to Dashboard**
  - [ ] Login as Warehouse Admin
  - [ ] Automatically redirected to dashboard
  - [ ] Page loads successfully
  - [ ] No console errors

### KPI Cards
- [ ] **Total Orders Card**
  - [ ] Card displays
  - [ ] Shows number
  - [ ] Shows label: "Total Orders"
  - [ ] Shows icon

- [ ] **Completed Orders Card**
  - [ ] Card displays
  - [ ] Shows number
  - [ ] Shows label: "Completed Orders"
  - [ ] Shows icon

- [ ] **Pending Orders Card**
  - [ ] Card displays
  - [ ] Shows number
  - [ ] Shows label: "Pending Orders"
  - [ ] Shows icon

- [ ] **Total Revenue Card**
  - [ ] Card displays
  - [ ] Shows amount
  - [ ] Shows label: "Total Revenue"
  - [ ] Shows icon

### Real-time Updates
- [ ] **Initial Load**
  - [ ] KPI cards show data
  - [ ] Check Network tab: API call to `/api/team-leader/dashboard/kpis`
  - [ ] Response status: 200

- [ ] **Real-time Updates (5 seconds)**
  - [ ] Wait 5 seconds
  - [ ] Check Network tab: API call to `/api/team-leader/dashboard/kpis/realtime`
  - [ ] Response status: 200
  - [ ] KPI values update (or stay same if no new data)

- [ ] **Continuous Updates**
  - [ ] Wait another 5 seconds
  - [ ] Verify another API call
  - [ ] Pattern continues every 5 seconds

### Channel Filtering
- [ ] **Warehouse Admin Data**
  - [ ] Login as Warehouse Admin
  - [ ] Note KPI values
  - [ ] Logout

- [ ] **TikTok Data**
  - [ ] Login as TikTok
  - [ ] KPI values different from Warehouse Admin
  - [ ] Logout

- [ ] **Data Isolation Verified**
  - [ ] Each channel shows only their data
  - [ ] No overlap between channels

---

## 📦 Track Orders Testing

### Page Load
- [ ] **Navigate to Track Orders**
  - [ ] Click "Track Orders" in sidebar
  - [ ] Page loads successfully
  - [ ] URL: `/team-leader/track-orders`
  - [ ] No console errors

### Orders List
- [ ] **Orders Display**
  - [ ] Orders table visible
  - [ ] Column headers visible
  - [ ] Orders data displayed
  - [ ] Pagination visible (if applicable)

### Search Functionality
- [ ] **Search by Order Number**
  - [ ] Click search field
  - [ ] Type order number
  - [ ] Results filtered
  - [ ] Correct orders shown

- [ ] **Search by Customer Name**
  - [ ] Click search field
  - [ ] Type customer name
  - [ ] Results filtered
  - [ ] Correct orders shown

### Order Details
- [ ] **View Order Details**
  - [ ] Click on order row
  - [ ] Details modal/page opens
  - [ ] Shows order info
  - [ ] Shows items
  - [ ] Shows total amount

### Channel Filtering
- [ ] **Warehouse Admin Orders**
  - [ ] Login as Warehouse Admin
  - [ ] See Warehouse Admin orders only
  - [ ] Logout

- [ ] **TikTok Orders**
  - [ ] Login as TikTok
  - [ ] See TikTok orders only
  - [ ] Different from Warehouse Admin

---

## 📮 Packing Queue Testing

### Page Load
- [ ] **Navigate to Packing Queue**
  - [ ] Click "Packing Queue" in sidebar
  - [ ] Page loads successfully
  - [ ] URL: `/team-leader/packing-queue`
  - [ ] No console errors

### Pending Orders
- [ ] **Orders Display**
  - [ ] Pending orders visible
  - [ ] Status shows "pending"
  - [ ] Order details visible
  - [ ] Pack button visible

### Pack Functionality
- [ ] **Mark Order as Packed**
  - [ ] Click "Pack" button
  - [ ] Confirmation dialog appears
  - [ ] Click "Confirm"
  - [ ] Order status changes to "packed"
  - [ ] Success toast appears

- [ ] **Order Removed from Queue**
  - [ ] Packed order no longer in packing queue
  - [ ] Appears in dispatch queue

### Channel Filtering
- [ ] **Only Assigned Channel Orders**
  - [ ] Login as Warehouse Admin
  - [ ] See only Warehouse Admin pending orders
  - [ ] Logout and login as TikTok
  - [ ] See only TikTok pending orders

---

## 🚚 Dispatch Testing

### Page Load
- [ ] **Navigate to Dispatch**
  - [ ] Click "Dispatch" in sidebar
  - [ ] Page loads successfully
  - [ ] URL: `/team-leader/dispatch`
  - [ ] No console errors

### Packed Orders
- [ ] **Orders Display**
  - [ ] Packed orders visible
  - [ ] Status shows "packed"
  - [ ] Order details visible
  - [ ] Dispatch form visible

### Dispatch Form
- [ ] **Enter Courier Info**
  - [ ] Click courier field
  - [ ] Enter courier name
  - [ ] Click tracking field
  - [ ] Enter tracking number

- [ ] **Submit Dispatch**
  - [ ] Click "Dispatch" button
  - [ ] Confirmation dialog appears
  - [ ] Click "Confirm"
  - [ ] Order status changes to "dispatched"
  - [ ] Success toast appears

- [ ] **Order Removed from Queue**
  - [ ] Dispatched order no longer in dispatch queue

### Channel Filtering
- [ ] **Only Assigned Channel Orders**
  - [ ] Login as Warehouse Admin
  - [ ] See only Warehouse Admin packed orders
  - [ ] Logout and login as TikTok
  - [ ] See only TikTok packed orders

---

## 🚨 Inventory Alerts Testing

### Page Load
- [ ] **Navigate to Inventory Alerts**
  - [ ] Click "Inventory Alerts" in sidebar
  - [ ] Page loads successfully
  - [ ] URL: `/team-leader/inventory-alerts`
  - [ ] No console errors

### Alerts Display
- [ ] **Low Stock Alerts**
  - [ ] Alerts visible
  - [ ] Product name shown
  - [ ] Current stock shown
  - [ ] Min threshold shown
  - [ ] Severity level shown

### Severity Levels
- [ ] **Low Severity**
  - [ ] Shows "Low" badge
  - [ ] Yellow/orange color

- [ ] **Critical Severity**
  - [ ] Shows "Critical" badge
  - [ ] Red color

### Channel Filtering
- [ ] **Only Assigned Channel Alerts**
  - [ ] Login as Warehouse Admin
  - [ ] See only Warehouse Admin alerts
  - [ ] Logout and login as TikTok
  - [ ] See only TikTok alerts

---

## ⚙️ Settings Testing

### Page Load
- [ ] **Navigate to Settings**
  - [ ] Click "Settings" in sidebar
  - [ ] Page loads successfully
  - [ ] URL: `/team-leader/settings`
  - [ ] No console errors

### User Information
- [ ] **Display User Info**
  - [ ] Shows username
  - [ ] Shows display name
  - [ ] Shows email
  - [ ] Shows assigned channel
  - [ ] Shows role

### Password Change
- [ ] **Change Password Form**
  - [ ] Current password field visible
  - [ ] New password field visible
  - [ ] Confirm password field visible
  - [ ] Submit button visible

- [ ] **Valid Password Change**
  - [ ] Enter current password
  - [ ] Enter new password
  - [ ] Confirm new password
  - [ ] Click submit
  - [ ] Success toast appears
  - [ ] Can login with new password

- [ ] **Invalid Password Change**
  - [ ] Enter wrong current password
  - [ ] See error message
  - [ ] Password not changed

---

## 🚪 Logout Testing

### Logout Button
- [ ] **Click Logout**
  - [ ] Click "Logout" in sidebar
  - [ ] Confirmation modal appears
  - [ ] Modal shows: "Are you sure you want to log out?"

### Confirm Logout
- [ ] **Confirm Logout**
  - [ ] Click "Logout" button in modal
  - [ ] Session cleared from localStorage
  - [ ] Redirected to `/team-leader-login`
  - [ ] Can login again

- [ ] **Cancel Logout**
  - [ ] Click "Logout" in sidebar
  - [ ] Click "Cancel" button
  - [ ] Modal closes
  - [ ] Still logged in
  - [ ] Can continue using dashboard

---

## 🔒 Data Isolation Testing

### Warehouse Admin vs TikTok
- [ ] **Login as Warehouse Admin**
  - [ ] Note orders displayed
  - [ ] Note KPI values
  - [ ] Note inventory alerts

- [ ] **Logout**
  - [ ] Click logout
  - [ ] Confirm logout
  - [ ] Redirected to login

- [ ] **Login as TikTok**
  - [ ] Select TikTok channel
  - [ ] Enter password
  - [ ] See different orders
  - [ ] See different KPI values
  - [ ] See different alerts

- [ ] **Verify No Overlap**
  - [ ] Warehouse Admin orders NOT visible to TikTok
  - [ ] TikTok orders NOT visible to Warehouse Admin
  - [ ] Each channel isolated

### All Channels
- [ ] **Test Each Channel**
  - [ ] Warehouse Admin - isolated data
  - [ ] TikTok - isolated data
  - [ ] Shopee - isolated data
  - [ ] Facebook - isolated data
  - [ ] Lazada - isolated data

---

## 🌐 Browser & Device Testing

### Desktop Browsers
- [ ] **Chrome**
  - [ ] All pages load
  - [ ] No console errors
  - [ ] Responsive layout

- [ ] **Firefox**
  - [ ] All pages load
  - [ ] No console errors
  - [ ] Responsive layout

- [ ] **Safari**
  - [ ] All pages load
  - [ ] No console errors
  - [ ] Responsive layout

- [ ] **Edge**
  - [ ] All pages load
  - [ ] No console errors
  - [ ] Responsive layout

### Mobile Devices
- [ ] **Mobile Responsive**
  - [ ] Login page responsive
  - [ ] Dashboard responsive
  - [ ] Sidebar collapses on mobile
  - [ ] Touch interactions work

- [ ] **Tablet**
  - [ ] Layout adapts to tablet size
  - [ ] All features accessible

---

## 🐛 Error Handling Testing

### Invalid Inputs
- [ ] **Empty Channel**
  - [ ] Leave channel empty
  - [ ] Click login
  - [ ] See error: "Channel is required"

- [ ] **Empty Password**
  - [ ] Select channel
  - [ ] Leave password empty
  - [ ] Click login
  - [ ] See error: "Password is required"

### API Errors
- [ ] **Network Error**
  - [ ] Disconnect internet
  - [ ] Try to load page
  - [ ] See error message
  - [ ] Reconnect internet
  - [ ] Page works again

- [ ] **Server Error**
  - [ ] Check browser console
  - [ ] No 500 errors
  - [ ] Proper error messages shown

### Session Errors
- [ ] **Expired Session**
  - [ ] Clear localStorage manually
  - [ ] Try to access dashboard
  - [ ] Redirected to login

- [ ] **Invalid Session**
  - [ ] Modify session data in localStorage
  - [ ] Try to access dashboard
  - [ ] Redirected to login

---

## 📊 Performance Testing

### Page Load Times
- [ ] **Login Page**
  - [ ] Loads in < 2 seconds
  - [ ] No lag

- [ ] **Dashboard**
  - [ ] Loads in < 3 seconds
  - [ ] KPI cards render quickly

- [ ] **Orders Page**
  - [ ] Loads in < 3 seconds
  - [ ] Table renders quickly

### API Response Times
- [ ] **Login API**
  - [ ] Response time < 500ms
  - [ ] Check Network tab

- [ ] **Dashboard KPI API**
  - [ ] Response time < 500ms
  - [ ] Real-time updates smooth

- [ ] **Orders API**
  - [ ] Response time < 1000ms
  - [ ] Table loads smoothly

### Memory Usage
- [ ] **No Memory Leaks**
  - [ ] Open DevTools
  - [ ] Check Memory tab
  - [ ] No continuous growth
  - [ ] Stable memory usage

---

## ✅ Final Verification

### All Features Working
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Orders page works
- [ ] Packing queue works
- [ ] Dispatch works
- [ ] Inventory alerts work
- [ ] Settings work
- [ ] Logout works

### Data Isolation
- [ ] Each channel sees only their data
- [ ] No data leakage between channels
- [ ] Admin can see all channels

### No Errors
- [ ] No console errors
- [ ] No API errors
- [ ] No database errors
- [ ] No network errors

### Performance
- [ ] Pages load quickly
- [ ] APIs respond quickly
- [ ] No memory leaks
- [ ] Smooth interactions

---

## 📝 Sign-Off

### Testing Complete
- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for production

### Issues Found
- [ ] Document issues
- [ ] Create bug reports
- [ ] Fix before deployment

### Ready to Deploy
- [ ] Commit changes
- [ ] Push to GitHub
- [ ] Deploy to production

---

## 📞 Support

**If any test fails:**
1. Check TEAM-LEADER-TESTING-GUIDE.md
2. Check TEAM-LEADER-ARCHITECTURE.md
3. Review browser console for errors
4. Check server logs
5. Verify database data

---

**Testing Date:** _______________
**Tester Name:** _______________
**Status:** ✅ PASS / ❌ FAIL

---

**Print this checklist and check off each item as you test!**
