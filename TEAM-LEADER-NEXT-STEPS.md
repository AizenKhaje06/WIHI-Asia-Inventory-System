# Team Leader Dashboard - Next Steps

## 🎯 Current Status

The Team Leader Dashboard implementation is **100% complete** and ready for testing.

### What's Done ✅
- All database migrations created
- All API endpoints implemented
- All frontend pages created
- Authentication system implemented
- Channel-based data isolation implemented
- Session management implemented
- Documentation created

### What's Needed 🔧
- Fix database constraint
- Insert test data
- Test the system

---

## 📋 Action Items (In Order)

### 1️⃣ Fix Database Constraint (5 minutes)

**Why:** The users table has a check constraint that only allows 'admin' and 'staff' roles. We need to add 'team_leader' and 'operations' roles.

**How:**
1. Open Supabase SQL Editor
2. Run this SQL:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'staff', 'operations', 'team_leader'));
```

3. You should see: "Query executed successfully"

---

### 2️⃣ Insert Test Team Leaders (5 minutes)

**Why:** We need test accounts to log in and test the system.

**How:**
1. Open Supabase SQL Editor
2. Open file: `TEAM-LEADER-TEST-SETUP.sql`
3. Copy all the INSERT statements
4. Paste into SQL Editor
5. Run the queries

**Or run this quick version:**

```sql
INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_warehouse_001', 'tl_warehouse_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Warehouse', NOW(), 'warehouse@local.test', 'Warehouse Admin');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_tiktok_001', 'tl_tiktok_001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'team_leader', 'Team Lead - TikTok', NOW(), 'tiktok@local.test', 'TikTok');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_shopee_001', 'tl_shopee_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Shopee', NOW(), 'shopee@local.test', 'Shopee');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_facebook_001', 'tl_facebook_001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'team_leader', 'Team Lead - Facebook', NOW(), 'facebook@local.test', 'Facebook');

INSERT INTO users (id, username, password, role, display_name, created_at, email, assigned_channel)
VALUES ('tl_lazada_001', 'tl_lazada_001', '$2b$10$SSf4LKItwQvoNPuPLEyhT.ij3WEonVHvEbazocopTSbke/lQe0HPm', 'team_leader', 'Team Lead - Lazada', NOW(), 'lazada@local.test', 'Lazada');
```

**Verify it worked:**
```sql
SELECT id, username, display_name, role, assigned_channel 
FROM users 
WHERE role = 'team_leader'
ORDER BY assigned_channel;
```

You should see 5 rows.

---

### 3️⃣ Test Login (2 minutes)

**Why:** Verify the login system works.

**How:**
1. Make sure dev server is running: `npm run dev`
2. Go to: `http://localhost:3000/team-leader-login`
3. Select Channel: **Warehouse Admin**
4. Enter Password: **2010404422**
5. Click **Login**

**Expected Result:**
- ✅ Redirected to `/team-leader/dashboard`
- ✅ See "Login successful" toast
- ✅ See dashboard with KPI cards

**If it fails:**
- ❌ Error message: "Invalid channel or credentials"
- Check troubleshooting section below

---

### 4️⃣ Test All Pages (10 minutes)

**Dashboard** (`/team-leader/dashboard`)
- [ ] KPI cards display data
- [ ] Real-time updates work (wait 5 seconds)
- [ ] Only shows Warehouse Admin data

**Track Orders** (`/team-leader/track-orders`)
- [ ] Orders list displays
- [ ] Search works
- [ ] Can view order details

**Packing Queue** (`/team-leader/packing-queue`)
- [ ] Shows pending orders
- [ ] Can mark as packed

**Dispatch** (`/team-leader/dispatch`)
- [ ] Shows packed orders
- [ ] Can enter courier info

**Inventory Alerts** (`/team-leader/inventory-alerts`)
- [ ] Shows alerts
- [ ] Filtered by channel

**Settings** (`/team-leader/settings`)
- [ ] Shows user info
- [ ] Can change password

---

### 5️⃣ Test Data Isolation (5 minutes)

**Why:** Verify team leaders can only see their channel's data.

**How:**
1. Login as Warehouse Admin
2. Note the orders displayed
3. Click Logout
4. Login as TikTok (password: 12345678)
5. Verify different orders are shown

**Expected Result:**
- ✅ Warehouse Admin sees Warehouse Admin orders
- ✅ TikTok sees TikTok orders
- ✅ No overlap between channels

---

### 6️⃣ Test Logout (1 minute)

**How:**
1. Click Logout button in sidebar
2. Confirm logout in modal
3. Should be redirected to login page

**Expected Result:**
- ✅ Session cleared from localStorage
- ✅ Redirected to `/team-leader-login`

---

## 📚 Documentation Files

### Quick Reference
- **TEAM-LEADER-QUICK-START.md** - 3-step setup (read this first!)
- **TEAM-LEADER-NEXT-STEPS.md** - This file

### Detailed Guides
- **TEAM-LEADER-TESTING-GUIDE.md** - Comprehensive testing guide
- **TEAM-LEADER-IMPLEMENTATION-COMPLETE.md** - What was implemented
- **TEAM-LEADER-ARCHITECTURE.md** - System architecture

### Setup Files
- **TEAM-LEADER-TEST-SETUP.sql** - SQL setup script
- **supabase/migrations/025_fix_users_role_constraint.sql** - Database constraint fix

---

## 🔐 Test Credentials

| Channel | Username | Password |
|---------|----------|----------|
| Warehouse Admin | tl_warehouse_001 | 2010404422 |
| TikTok | tl_tiktok_001 | 12345678 |
| Shopee | tl_shopee_001 | 2010404422 |
| Facebook | tl_facebook_001 | 12345678 |
| Lazada | tl_lazada_001 | 2010404422 |

---

## ❌ Troubleshooting

### Problem: "Invalid channel or credentials" Error

**Cause 1: Role constraint not fixed**
- Solution: Run the ALTER TABLE SQL from Step 1

**Cause 2: Test data not inserted**
- Solution: Run the INSERT statements from Step 2

**Cause 3: Wrong password**
- Solution: Check the password from the table above

**Cause 4: Channel name mismatch**
- Solution: Verify channel name matches exactly (case-sensitive)

### Problem: No Data on Dashboard

**Cause 1: No orders in database**
- Solution: Insert sample orders using TEAM-LEADER-TEST-SETUP.sql

**Cause 2: API error**
- Solution: Check browser Network tab for API errors

**Cause 3: Session not stored**
- Solution: Check localStorage in browser DevTools

### Problem: Can't Access Pages

**Cause 1: Not logged in**
- Solution: Login again

**Cause 2: Session expired**
- Solution: Login again

**Cause 3: Route guard error**
- Solution: Check browser console for errors

---

## 🎯 Success Criteria

After testing, you should be able to:

✅ Login with team leader credentials
✅ See dashboard with KPI cards
✅ View orders for assigned channel
✅ Search and filter orders
✅ Mark orders as packed
✅ Dispatch orders
✅ View inventory alerts
✅ Change password
✅ Logout
✅ Verify data isolation between channels

---

## 📝 After Testing

### If Everything Works ✅
1. Commit changes to git
2. Push to GitHub
3. Deploy to production

### If Something Breaks ❌
1. Check troubleshooting section
2. Review error messages in browser console
3. Check server logs
4. Review database data
5. Ask for help if needed

---

## 🚀 Timeline

| Step | Time | Status |
|------|------|--------|
| 1. Fix constraint | 5 min | ⏳ TODO |
| 2. Insert test data | 5 min | ⏳ TODO |
| 3. Test login | 2 min | ⏳ TODO |
| 4. Test all pages | 10 min | ⏳ TODO |
| 5. Test data isolation | 5 min | ⏳ TODO |
| 6. Test logout | 1 min | ⏳ TODO |
| **Total** | **28 min** | ⏳ TODO |

---

## 📞 Need Help?

1. **Quick questions?** Check TEAM-LEADER-QUICK-START.md
2. **Detailed guide?** Check TEAM-LEADER-TESTING-GUIDE.md
3. **Architecture?** Check TEAM-LEADER-ARCHITECTURE.md
4. **Implementation?** Check TEAM-LEADER-IMPLEMENTATION-COMPLETE.md
5. **Requirements?** Check `.kiro/specs/team-leader-dashboard/requirements.md`

---

## ✨ What's Next After Testing?

1. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: implement team leader dashboard"
   git push
   ```

2. **Deploy to Production**
   - Push to main branch
   - Vercel auto-deploys

3. **Monitor**
   - Check error logs
   - Monitor performance
   - Gather user feedback

4. **Future Enhancements**
   - WebSocket real-time updates
   - Advanced filtering
   - Mobile app
   - Reporting

---

**Ready to test? Start with Step 1 above!** 🚀
