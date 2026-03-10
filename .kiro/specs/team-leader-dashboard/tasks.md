# Implementation Plan: Team Leader Dashboard

## Overview

This implementation plan breaks down the Team Leader Dashboard feature into discrete, manageable coding tasks. The system requires database schema updates, authentication API endpoints, role-based access control middleware, frontend components for login and dashboards, and comprehensive testing. Tasks are organized to build incrementally from database foundation through authentication, then frontend components, and finally integration and testing.

## Tasks

- [x] 1. Database Schema Updates
  - [x] 1.1 Create migration for users table updates
    - Add `assigned_channel` field (VARCHAR, nullable)
    - Add `role` field (VARCHAR, default 'operations')
    - Add indexes on (assigned_channel, role) for query performance
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 1.2 Create migration for orders table channel association
    - Add `channel` field (VARCHAR) to orders table if not exists
    - Add index on channel for filtering
    - _Requirements: 5.1, 6.1, 7.1_
  
  - [x] 1.3 Create migration for inventory_alerts table
    - Create table with: id, product_id, store_id, current_stock, threshold, channel, created_at
    - Add indexes on (channel, store_id) for filtering
    - _Requirements: 8.1, 8.2_
  
  - [x] 1.4 Create migration for dispatch_tracking table
    - Create table with: id, order_id, dispatch_timestamp, tracking_info, channel, created_at
    - Add indexes on (order_id, channel)
    - _Requirements: 7.3, 7.5_

- [x] 2. Authentication API Endpoints
  - [x] 2.1 Implement POST /api/auth/login endpoint
    - Accept channel and password in request body
    - Query users table filtering by assigned_channel and password
    - Validate password matches (use secure comparison)
    - Create session/JWT token with user_id and assigned_channel
    - Return token and user info on success, error on failure
    - _Requirements: 1.2, 1.3, 1.6_
  
  - [x] 2.2 Implement POST /api/auth/logout endpoint
    - Clear session/invalidate token
    - Return success response
    - _Requirements: 9.5_
  
  - [x] 2.3 Implement POST /api/auth/change-password endpoint
    - Require authentication (middleware)
    - Accept current_password and new_password
    - Validate current password matches user's stored password
    - Validate new password is at least 8 characters
    - Update user's password in database
    - Return success or error message
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [x] 2.4 Implement GET /api/auth/channels endpoint
    - Return list of available channels: Warehouse Admin, TikTok, Shopee, Facebook, Lazada
    - No authentication required
    - _Requirements: 1.1_

- [x] 3. Authentication Middleware & Session Management
  - [x] 3.1 Create authentication middleware
    - Verify JWT token or session cookie
    - Extract user_id and assigned_channel from token
    - Attach to request context for downstream use
    - Return 401 if token invalid or missing
    - _Requirements: 1.6, 9.4_
  
  - [x] 3.2 Create channel-based access control middleware
    - Verify user's assigned_channel matches requested resource's channel
    - Return 403 if channel mismatch
    - Apply to all protected endpoints
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [x] 3.3 Create role-based permission middleware
    - Check user role against required permissions
    - Support roles: admin, operations, team_leader
    - Return 403 if insufficient permissions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [-] 4. Staff Management API Endpoints
  - [x] 4.1 Implement POST /api/admin/staff endpoint
    - Require admin role (middleware)
    - Accept: staff_name, assigned_channel, password
    - Validate all required fields present
    - Create user record with role='team_leader'
    - Return created user or validation errors
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.2 Implement GET /api/admin/staff endpoint
    - Require admin role (middleware)
    - Return all staff members grouped by assigned_channel
    - Include: id, name, channel, role, created_at
    - _Requirements: 2.6_
  
  - [x] 4.3 Implement PUT /api/admin/staff/:id endpoint
    - Require admin role (middleware)
    - Allow updating: staff_name, assigned_channel, password
    - Validate required fields
    - Return updated user or error
    - _Requirements: 2.2, 2.3_
  
  - [x] 4.4 Implement DELETE /api/admin/staff/:id endpoint
    - Require admin role (middleware)
    - Delete staff member record
    - Return success or error
    - _Requirements: 2.1_

- [-] 5. Dashboard API Endpoints
  - [x] 5.1 Implement GET /api/dashboard/kpis endpoint
    - Require authentication (middleware)
    - Filter orders by user's assigned_channel
    - Calculate KPIs: Revenue, Profit, Items Sold, Profit Margin
    - Return KPIs for current period
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [x] 5.2 Implement GET /api/dashboard/kpis/realtime endpoint
    - Require authentication (middleware)
    - Return same KPIs as 5.1 with latest data
    - Ensure data reflects changes within 5 seconds
    - _Requirements: 4.4_

- [-] 6. Order Tracking API Endpoints
  - [ ] 6.1 Implement GET /api/orders endpoint
    - Require authentication (middleware)
    - Filter orders by user's assigned_channel
    - Return: order_id, customer, status, items, channel
    - Support pagination
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 6.2 Implement GET /api/orders/search endpoint
    - Require authentication (middleware)
    - Accept search query parameter
    - Filter by assigned_channel and search term
    - Return matching orders
    - _Requirements: 5.4_
  
  - [ ] 6.3 Implement GET /api/orders/:id endpoint
    - Require authentication (middleware)
    - Verify order belongs to user's assigned_channel
    - Return full order details
    - _Requirements: 5.2_

- [-] 7. Packing Queue API Endpoints
  - [ ] 7.1 Implement GET /api/packing-queue endpoint
    - Require authentication (middleware)
    - Filter orders by assigned_channel and status='unpacked'
    - Return: order_id, customer, items, quantities
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [ ] 7.2 Implement PUT /api/packing-queue/:id/pack endpoint
    - Require authentication (middleware)
    - Verify order belongs to user's assigned_channel
    - Validate all items are available
    - Update order status to 'packed'
    - Remove from packing queue
    - _Requirements: 6.3, 6.5_

- [-] 8. Warehouse Dispatch API Endpoints
  - [ ] 8.1 Implement GET /api/dispatch endpoint
    - Require authentication (middleware)
    - Filter orders by assigned_channel and status='packed'
    - Return: order_id, customer, packed_items, tracking_info
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 8.2 Implement PUT /api/dispatch/:id/dispatch endpoint
    - Require authentication (middleware)
    - Verify order belongs to user's assigned_channel
    - Update order status to 'dispatched'
    - Generate tracking information
    - Record dispatch timestamp
    - Update inventory accordingly
    - _Requirements: 7.3, 7.5_

- [-] 9. Inventory Alerts API Endpoints
  - [ ] 9.1 Implement GET /api/inventory-alerts endpoint
    - Require authentication (middleware)
    - Filter alerts by user's assigned_channel
    - Return: product_name, current_stock, threshold, store_location
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 9.2 Implement real-time inventory alert updates
    - Set up trigger or polling mechanism
    - Update alerts when inventory levels change
    - Ensure real-time updates
    - _Requirements: 8.4, 8.5_

- [x] 10. Frontend: Login Page Component
  - [ ] 10.1 Create login page component
    - Display channel dropdown with 5 options
    - Display password input field
    - Display login button
    - Handle form submission
    - _Requirements: 1.1_
  
  - [ ] 10.2 Implement login form validation
    - Validate channel is selected
    - Validate password is not empty
    - Display validation errors
    - _Requirements: 1.1, 1.2_
  
  - [ ] 10.3 Implement login API integration
    - Call POST /api/auth/login with channel and password
    - Store returned token in localStorage/cookie
    - Redirect to dashboard on success
    - Display error message on failure
    - _Requirements: 1.3, 1.4, 1.5_

- [ ] 11. Frontend: Dashboard Component
  - [ ] 11.1 Create dashboard page component
    - Display KPI cards: Revenue, Profit, Items Sold, Profit Margin
    - Fetch data from GET /api/dashboard/kpis
    - Display loading state while fetching
    - _Requirements: 4.1, 4.2_
  
  - [ ] 11.2 Implement KPI data refresh
    - Set up polling or WebSocket for real-time updates
    - Update KPIs within 5 seconds of data change
    - _Requirements: 4.4_
  
  - [ ] 11.3 Implement channel-specific data display
    - Verify displayed data matches user's assigned_channel
    - Do not display data from other channels
    - _Requirements: 4.3_

- [ ] 12. Frontend: Track Orders Component
  - [ ] 12.1 Create track orders page component
    - Display table with columns: order_id, customer, status, items, channel
    - Fetch data from GET /api/orders
    - Implement pagination
    - _Requirements: 5.1, 5.2_
  
  - [ ] 12.2 Implement order search functionality
    - Add search input field
    - Call GET /api/orders/search with query
    - Display filtered results
    - _Requirements: 5.4_
  
  - [ ] 12.3 Implement order status updates
    - Set up polling or WebSocket for status changes
    - Update table when order status changes
    - _Requirements: 5.5_

- [ ] 13. Frontend: Packing Queue Component
  - [ ] 13.1 Create packing queue page component
    - Display table with columns: order_id, customer, items, quantities
    - Fetch data from GET /api/packing-queue
    - Display loading state
    - _Requirements: 6.1, 6.2_
  
  - [ ] 13.2 Implement pack order functionality
    - Add "Pack" button for each order
    - Call PUT /api/packing-queue/:id/pack
    - Remove packed order from queue
    - Display success/error message
    - _Requirements: 6.3, 6.5_

- [ ] 14. Frontend: Warehouse Dispatch Component
  - [ ] 14.1 Create warehouse dispatch page component
    - Display table with columns: order_id, customer, packed_items, tracking_info
    - Fetch data from GET /api/dispatch
    - Display loading state
    - _Requirements: 7.1, 7.2_
  
  - [ ] 14.2 Implement dispatch order functionality
    - Add "Dispatch" button for each order
    - Call PUT /api/dispatch/:id/dispatch
    - Display generated tracking information
    - Remove dispatched order from queue
    - _Requirements: 7.3, 7.5_

- [ ] 15. Frontend: Inventory Alerts Component
  - [ ] 15.1 Create inventory alerts page component
    - Display table with columns: product_name, current_stock, threshold, store_location
    - Fetch data from GET /api/inventory-alerts
    - Display loading state
    - _Requirements: 8.1, 8.2_
  
  - [ ] 15.2 Implement real-time alert updates
    - Set up polling or WebSocket for inventory changes
    - Update alerts in real-time
    - _Requirements: 8.4, 8.5_

- [ ] 16. Frontend: Account Settings Component
  - [ ] 16.1 Create account settings page component
    - Display password change form
    - Include: current_password, new_password, confirm_password fields
    - _Requirements: 3.1_
  
  - [ ] 16.2 Implement password change functionality
    - Validate current password is entered
    - Validate new password is at least 8 characters
    - Validate new password and confirm match
    - Call POST /api/auth/change-password
    - Display success/error message
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 17. Frontend: Admin Staff Management Component
  - [ ] 17.1 Create admin staff management page component
    - Display staff list grouped by channel
    - Include: name, channel, role, created_at
    - Add "Add Staff" button
    - _Requirements: 2.1, 2.6_
  
  - [ ] 17.2 Implement add staff functionality
    - Create modal/form for adding staff
    - Accept: staff_name, assigned_channel, password
    - Validate all required fields
    - Call POST /api/admin/staff
    - Refresh staff list on success
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 17.3 Implement edit staff functionality
    - Create modal/form for editing staff
    - Allow updating: staff_name, assigned_channel, password
    - Call PUT /api/admin/staff/:id
    - Refresh staff list on success
    - _Requirements: 2.2, 2.3_
  
  - [ ] 17.4 Implement delete staff functionality
    - Add delete button for each staff member
    - Confirm before deletion
    - Call DELETE /api/admin/staff/:id
    - Refresh staff list on success
    - _Requirements: 2.1_

- [ ] 18. Frontend: Navigation & Layout
  - [ ] 18.1 Create main layout component
    - Add sidebar with navigation links
    - Include: Dashboard, Track Orders, Packing Queue, Dispatch, Inventory Alerts, Account Settings
    - Show admin-only links (Staff Management) for admin users
    - _Requirements: 10.1_
  
  - [ ] 18.2 Implement logout functionality
    - Add logout button in header/sidebar
    - Call POST /api/auth/logout
    - Clear stored token
    - Redirect to login page
    - _Requirements: 9.5_
  
  - [ ] 18.3 Implement role-based navigation
    - Show/hide navigation items based on user role
    - Admin sees all items including Staff Management
    - Team leaders see only their allowed pages
    - _Requirements: 10.1, 10.2_

- [ ] 19. Access Control & Security
  - [ ] 19.1 Implement protected routes
    - Create route guard component
    - Check authentication before rendering protected pages
    - Redirect to login if not authenticated
    - _Requirements: 9.4_
  
  - [ ] 19.2 Implement channel-based access control in frontend
    - Verify API responses contain only user's channel data
    - Display error if unauthorized access attempted
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 19.3 Implement role-based access control in frontend
    - Verify user role before showing admin features
    - Disable/hide admin functions for non-admin users
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 20. Checkpoint - Core Features Complete
  - Ensure all API endpoints are implemented and tested
  - Ensure all frontend components are created and integrated
  - Ensure authentication and authorization are working
  - Verify channel-based data isolation is enforced
  - Ask the user if questions arise

- [ ]* 21. Unit Tests for API Endpoints
  - [ ]* 21.1 Write unit tests for authentication endpoints
    - Test successful login with valid credentials
    - Test login failure with invalid password
    - Test login failure with unassigned channel
    - Test password change with valid/invalid current password
    - Test password validation (minimum 8 characters)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 21.2 Write unit tests for staff management endpoints
    - Test adding staff with all required fields
    - Test adding staff with missing fields
    - Test staff list retrieval and grouping by channel
    - Test staff update and delete operations
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 21.3 Write unit tests for dashboard endpoints
    - Test KPI calculation for specific channel
    - Test that KPIs only include channel's orders
    - Test real-time KPI updates
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 21.4 Write unit tests for order endpoints
    - Test order retrieval filtered by channel
    - Test order search within channel
    - Test order status updates
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 21.5 Write unit tests for packing queue endpoints
    - Test packing queue retrieval for channel
    - Test pack order status update
    - Test item availability validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 21.6 Write unit tests for dispatch endpoints
    - Test dispatch queue retrieval for channel
    - Test dispatch order status update
    - Test tracking information generation
    - Test inventory update on dispatch
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 21.7 Write unit tests for inventory alerts endpoints
    - Test alert retrieval filtered by channel
    - Test alert generation when stock is low
    - Test real-time alert updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 22. Unit Tests for Frontend Components
  - [ ]* 22.1 Write unit tests for login component
    - Test channel dropdown displays all options
    - Test form validation
    - Test successful login flow
    - Test error message display on login failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 22.2 Write unit tests for dashboard component
    - Test KPI display
    - Test data refresh
    - Test channel-specific data display
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 22.3 Write unit tests for track orders component
    - Test order table display
    - Test search functionality
    - Test status update display
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 22.4 Write unit tests for packing queue component
    - Test queue display
    - Test pack order functionality
    - Test queue update after packing
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 22.5 Write unit tests for dispatch component
    - Test dispatch queue display
    - Test dispatch order functionality
    - Test tracking information display
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 22.6 Write unit tests for inventory alerts component
    - Test alert display
    - Test real-time alert updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 23. Access Control & Security Tests
  - [ ]* 23.1 Write tests for authentication middleware
    - Test valid token acceptance
    - Test invalid token rejection
    - Test missing token rejection
    - _Requirements: 1.6, 9.4_
  
  - [ ]* 23.2 Write tests for channel-based access control
    - Test user can only access their channel's data
    - Test cross-channel access is denied
    - Test API filtering by channel
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 23.3 Write tests for role-based access control
    - Test admin can access all features
    - Test team_leader cannot access admin features
    - Test operations role has correct permissions
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 24. Final Checkpoint - All Tests Pass
  - Ensure all unit tests pass
  - Ensure all access control tests pass
  - Verify no data leakage between channels
  - Verify authentication and authorization working correctly
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Channel-based access control is enforced at both API and frontend levels
- All API endpoints require authentication middleware
- Admin endpoints require additional role-based authorization
- Database migrations should be run before API implementation
- Frontend components should be integrated with the main layout after creation
