# Team Leader Dashboard - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEAM LEADER DASHBOARD                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Login Page                Dashboard              Settings      │
│  ├─ Channel Select        ├─ KPI Cards           ├─ User Info  │
│  ├─ Password Input        ├─ Real-time Updates   ├─ Password   │
│  └─ Submit                └─ Channel Filter      │   Change    │
│                                                  └─ Logout     │
│                                                                 │
│  Track Orders            Packing Queue          Dispatch       │
│  ├─ Order List           ├─ Pending Orders      ├─ Packed      │
│  ├─ Search               ├─ Pack Button         │   Orders     │
│  └─ Order Details        └─ Status Update       ├─ Courier     │
│                                                 │   Form       │
│  Inventory Alerts                               └─ Tracking    │
│  ├─ Low Stock Alerts                                           │
│  ├─ Severity Levels                                            │
│  └─ Channel Filter                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    localStorage (Session)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Authentication                Dashboard                        │
│  ├─ POST /team-leader-login   ├─ GET /kpis                    │
│  ├─ POST /logout              └─ GET /kpis/realtime           │
│  ├─ POST /change-password                                      │
│  └─ GET /channels             Orders                           │
│                               ├─ GET /orders                   │
│  Staff Management             ├─ GET /orders/search            │
│  ├─ GET /staff                └─ GET /orders/[id]              │
│  ├─ POST /staff                                                │
│  ├─ PUT /staff/[id]           Packing                          │
│  └─ DELETE /staff/[id]        ├─ GET /packing-queue            │
│                               └─ POST /packing-queue/[id]/pack │
│                                                                 │
│                               Dispatch                         │
│                               ├─ GET /dispatch                 │
│                               └─ POST /dispatch/[id]/dispatch  │
│                                                                 │
│                               Inventory                        │
│                               └─ GET /inventory-alerts         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Middleware (Auth Check)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  users                    orders                               │
│  ├─ id                    ├─ id                                │
│  ├─ username              ├─ order_number                      │
│  ├─ password (bcrypt)     ├─ customer_name                     │
│  ├─ role                  ├─ total_amount                      │
│  ├─ display_name          ├─ status                           │
│  ├─ email                 ├─ sales_channel ⭐                 │
│  ├─ assigned_channel ⭐   ├─ created_at                       │
│  └─ created_at            └─ ...                              │
│                                                                 │
│  inventory_alerts         dispatch_tracking                    │
│  ├─ id                    ├─ id                                │
│  ├─ product_id            ├─ order_id                         │
│  ├─ current_stock         ├─ courier                          │
│  ├─ min_threshold         ├─ tracking_number                  │
│  ├─ severity              ├─ status                           │
│  ├─ sales_channel ⭐      ├─ dispatched_at                    │
│  └─ created_at            └─ ...                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

1. User navigates to /team-leader-login
   ↓
2. Page loads with channel dropdown
   ↓
3. User selects channel (e.g., "Warehouse Admin")
   ↓
4. User enters password
   ↓
5. User clicks "Login"
   ↓
6. Frontend sends POST /api/auth/team-leader-login
   {
     "channel": "Warehouse Admin",
     "password": "2010404422"
   }
   ↓
7. Backend queries users table:
   SELECT * FROM users 
   WHERE assigned_channel = 'Warehouse Admin' 
   AND role = 'team_leader'
   ↓
8. Backend verifies password with bcrypt
   ↓
9. If valid, return session data:
   {
     "success": true,
     "user": { ... },
     "sessionData": {
       "userId": "tl_warehouse_001",
       "assignedChannel": "Warehouse Admin",
       "role": "team_leader",
       ...
     }
   }
   ↓
10. Frontend stores session in localStorage
    ├─ teamLeaderSession (full session)
    ├─ x-team-leader-user-id
    ├─ x-team-leader-channel
    └─ x-team-leader-role
   ↓
11. Frontend redirects to /team-leader/dashboard
   ↓
12. Dashboard loads and fetches KPI data
    (filtered by assigned channel)
```

---

## Data Isolation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              DATA ISOLATION BY CHANNEL                          │
└─────────────────────────────────────────────────────────────────┘

Team Leader: Warehouse Admin
├─ Session: assignedChannel = "Warehouse Admin"
├─ Can Access:
│  ├─ Orders with sales_channel = "Warehouse Admin"
│  ├─ Inventory alerts with sales_channel = "Warehouse Admin"
│  └─ Dispatch tracking for Warehouse Admin orders
└─ Cannot Access:
   ├─ TikTok orders
   ├─ Shopee orders
   ├─ Facebook orders
   └─ Lazada orders

Team Leader: TikTok
├─ Session: assignedChannel = "TikTok"
├─ Can Access:
│  ├─ Orders with sales_channel = "TikTok"
│  ├─ Inventory alerts with sales_channel = "TikTok"
│  └─ Dispatch tracking for TikTok orders
└─ Cannot Access:
   ├─ Warehouse Admin orders
   ├─ Shopee orders
   ├─ Facebook orders
   └─ Lazada orders

Admin User
├─ Session: role = "admin"
├─ Can Access:
│  ├─ All orders (all channels)
│  ├─ All inventory alerts
│  ├─ All dispatch tracking
│  └─ Staff management
└─ No channel restrictions
```

---

## API Request Flow with Channel Filtering

```
┌─────────────────────────────────────────────────────────────────┐
│           API REQUEST WITH CHANNEL FILTERING                    │
└─────────────────────────────────────────────────────────────────┘

1. Frontend makes request:
   GET /api/team-leader/orders
   Headers: {
     "x-team-leader-channel": "Warehouse Admin",
     "x-team-leader-user-id": "tl_warehouse_001",
     "x-team-leader-role": "team_leader"
   }
   ↓
2. Middleware verifies session:
   ├─ Check if user is authenticated
   ├─ Check if user has team_leader role
   └─ Extract channel from headers
   ↓
3. API endpoint queries database:
   SELECT * FROM orders 
   WHERE sales_channel = 'Warehouse Admin'
   AND status IN ('pending', 'completed')
   ORDER BY created_at DESC
   ↓
4. Backend returns filtered data:
   {
     "success": true,
     "orders": [
       { id: "order_001", sales_channel: "Warehouse Admin", ... },
       { id: "order_002", sales_channel: "Warehouse Admin", ... }
     ]
   }
   ↓
5. Frontend displays data in table
```

---

## Real-time Updates Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              REAL-TIME KPI UPDATES                              │
└─────────────────────────────────────────────────────────────────┘

Dashboard Component
├─ useEffect (runs on mount)
│  └─ Fetch initial KPI data
│     GET /api/team-leader/dashboard/kpis
│
├─ setInterval (every 5 seconds)
│  └─ Fetch updated KPI data
│     GET /api/team-leader/dashboard/kpis/realtime
│
└─ Update state with new data
   └─ Re-render KPI cards

KPI Endpoints:
├─ GET /api/team-leader/dashboard/kpis
│  └─ Returns: totalOrders, completedOrders, pendingOrders, totalRevenue
│
└─ GET /api/team-leader/dashboard/kpis/realtime
   └─ Returns: same data (optimized for frequent calls)

Both endpoints:
├─ Filter by assigned_channel from session
├─ Exclude cancelled transactions
└─ Calculate metrics from database
```

---

## Database Schema

### users table (modified)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'operations', 'team_leader')),
  display_name TEXT,
  created_at TIMESTAMP,
  email TEXT,
  assigned_channel VARCHAR(50),  -- ⭐ NEW: Warehouse Admin, TikTok, Shopee, Facebook, Lazada
  
  INDEXES:
  - idx_users_assigned_channel
  - idx_users_role
  - idx_users_channel_role
);
```

### orders table (modified)
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT,
  total_amount DECIMAL,
  status TEXT,
  sales_channel VARCHAR(50),  -- ⭐ NEW: Warehouse Admin, TikTok, Shopee, Facebook, Lazada
  created_at TIMESTAMP,
  ...
);
```

### inventory_alerts table (new)
```sql
CREATE TABLE inventory_alerts (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  current_stock INTEGER,
  min_threshold INTEGER,
  severity TEXT,  -- low, critical
  sales_channel VARCHAR(50),  -- ⭐ Channel filtering
  created_at TIMESTAMP,
  ...
);
```

### dispatch_tracking table (new)
```sql
CREATE TABLE dispatch_tracking (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  courier TEXT,
  tracking_number TEXT,
  status TEXT,
  dispatched_at TIMESTAMP,
  ...
);
```

---

## Session Management

### localStorage Structure
```javascript
{
  // Full session object
  "teamLeaderSession": {
    "userId": "tl_warehouse_001",
    "username": "tl_warehouse_001",
    "displayName": "Team Lead - Warehouse",
    "email": "warehouse@local.test",
    "role": "team_leader",
    "assignedChannel": "Warehouse Admin",
    "timestamp": 1710000000000
  },
  
  // Individual headers for API requests
  "x-team-leader-user-id": "tl_warehouse_001",
  "x-team-leader-channel": "Warehouse Admin",
  "x-team-leader-role": "team_leader"
}
```

### Session Lifecycle
```
1. User logs in
   └─ Session created and stored in localStorage

2. User navigates pages
   └─ Session retrieved from localStorage
   └─ Used to fetch channel-specific data

3. User logs out
   └─ Session cleared from localStorage
   └─ Redirected to login page

4. Browser refresh
   └─ Session persists in localStorage
   └─ User remains logged in
```

---

## Error Handling

### Authentication Errors
```
401 Unauthorized
├─ Invalid channel or credentials
├─ Session expired
└─ Missing authentication headers

400 Bad Request
├─ Missing channel
├─ Missing password
└─ Invalid input format

500 Internal Server Error
├─ Database connection error
├─ Bcrypt error
└─ Unexpected server error
```

### Data Access Errors
```
403 Forbidden
├─ User trying to access different channel
├─ Insufficient permissions
└─ Role-based access denied

404 Not Found
├─ Order not found
├─ User not found
└─ Resource not found
```

---

## Security Measures

### 1. Password Security
- Bcrypt hashing (10 rounds)
- Passwords never stored in plain text
- Password comparison using bcrypt.compare()

### 2. Session Security
- Session stored in localStorage (client-side)
- Session includes timestamp for expiration checks
- Session cleared on logout

### 3. Channel Isolation
- All API endpoints verify assigned_channel
- Database queries filtered by channel
- Team leaders cannot access other channels

### 4. Role-Based Access
- Middleware checks user role
- Different permissions for admin vs team_leader
- Admin can access all channels

### 5. Input Validation
- Channel name validation
- Password length validation
- Email format validation

---

## Performance Considerations

### 1. Database Indexes
- `idx_users_assigned_channel` - Fast channel lookups
- `idx_users_role` - Fast role filtering
- `idx_users_channel_role` - Combined index for login queries

### 2. Real-time Updates
- Polling every 5 seconds (not WebSocket)
- Lightweight endpoint for frequent calls
- Caching at frontend level

### 3. Query Optimization
- Select only needed columns
- Filter at database level
- Use indexes for WHERE clauses

---

## Deployment Checklist

- [ ] Run all database migrations
- [ ] Fix users role constraint
- [ ] Insert test team leader accounts
- [ ] Test login with all channels
- [ ] Test data isolation
- [ ] Test all pages and features
- [ ] Verify API endpoints
- [ ] Check error handling
- [ ] Test logout
- [ ] Test password change
- [ ] Verify session persistence
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Commit changes
- [ ] Deploy to production

---

## Monitoring & Debugging

### Browser DevTools
- Check localStorage for session data
- Check Network tab for API calls
- Check Console for errors
- Check Application tab for storage

### Server Logs
- Check API endpoint logs
- Check database query logs
- Check authentication logs
- Check error logs

### Database
- Query users table for team leaders
- Query orders table for channel data
- Check inventory_alerts table
- Check dispatch_tracking table

---

## Future Enhancements

1. **WebSocket Real-time Updates**
   - Replace polling with WebSocket
   - Real-time notifications

2. **Advanced Filtering**
   - Date range filters
   - Status filters
   - Custom filters

3. **Reporting**
   - Channel-specific reports
   - Performance metrics
   - Analytics

4. **Mobile App**
   - Native mobile app
   - Offline support
   - Push notifications

5. **Integration**
   - Third-party logistics APIs
   - Payment gateway integration
   - Inventory management system

---

**Architecture Version: 1.0**
**Last Updated: March 10, 2026**
