# Requirements Document: Team Leader Dashboard

## Introduction

The Team Leader Dashboard is a role-based access system that enables staff members to manage channel-specific operations. Staff members authenticate using their assigned channel and a password-based identifier, then access a dedicated dashboard displaying only their channel's data. This system allows team leaders to manage orders through packing, dispatch, and tracking workflows while maintaining strict data isolation between channels.

## Glossary

- **Team_Leader**: A staff member assigned to manage operations for a specific sales channel
- **Sales_Channel**: A distribution channel (Shopee, Lazada, Facebook, TikTok, Physical Store/Warehouse Admin)
- **Channel_Data**: All orders, inventory, and KPIs associated with a specific sales channel
- **Password_Identifier**: A unique password that identifies a staff member (e.g., staff ID or employee number)
- **Assigned_Channel**: The sales channel to which a team leader is assigned
- **KPI**: Key Performance Indicator (Revenue, Profit, Items Sold, Profit Margin)
- **Packing_Queue**: Orders awaiting packing operations
- **Dispatch_Queue**: Packed orders ready for shipment
- **Inventory_Alert**: Notification for low stock items in channel stores
- **Admin**: System administrator with full access to all channels and settings
- **System**: The Team Leader Dashboard application

## Requirements

### Requirement 1: Team Leader Authentication

**User Story:** As a staff member, I want to log in using my assigned channel and password, so that I can access my channel-specific dashboard securely.

#### Acceptance Criteria

1. WHEN a staff member visits the login page THEN the System SHALL display a channel dropdown with options: Warehouse Admin, TikTok, Shopee, Facebook, Lazada
2. WHEN a staff member selects a channel and enters a password THEN the System SHALL validate the password against the assigned staff member for that channel
3. WHEN the password is valid for the selected channel THEN the System SHALL authenticate the staff member and redirect to their dashboard
4. WHEN the password is invalid THEN the System SHALL display an error message and prevent login
5. WHEN a staff member is not assigned to the selected channel THEN the System SHALL reject the login attempt and display an error message
6. WHEN a staff member successfully logs in THEN the System SHALL establish a session identifying both the staff member and their assigned channel

### Requirement 2: Admin Staff Management

**User Story:** As an admin, I want to add staff members to specific channels and assign passwords, so that I can manage team leader access.

#### Acceptance Criteria

1. WHEN an admin accesses the settings page THEN the System SHALL display a staff management interface
2. WHEN an admin adds a new staff member THEN the System SHALL require: staff name, assigned channel, and initial password
3. WHEN an admin assigns a password to a staff member THEN the System SHALL store the password as the staff member's identifier
4. WHEN an admin saves a new staff member THEN the System SHALL create a user record with the assigned_channel field set to the selected channel
5. WHEN an admin attempts to add a staff member without required fields THEN the System SHALL prevent the addition and display validation errors
6. WHEN an admin views the staff list THEN the System SHALL display all staff members grouped by their assigned channel

### Requirement 3: Team Leader Password Management

**User Story:** As a team leader, I want to change my password, so that I can maintain secure access to my account.

#### Acceptance Criteria

1. WHEN a team leader accesses account settings THEN the System SHALL display a password change interface
2. WHEN a team leader enters their current password and a new password THEN the System SHALL validate the current password
3. WHEN the current password is valid THEN the System SHALL update the password and display a success message
4. WHEN the current password is invalid THEN the System SHALL reject the change and display an error message
5. WHEN a team leader sets a new password THEN the System SHALL require the new password to be at least 8 characters

### Requirement 4: Channel-Specific Dashboard

**User Story:** As a team leader, I want to see a dashboard with only my channel's KPIs, so that I can monitor my channel's performance.

#### Acceptance Criteria

1. WHEN a team leader logs in THEN the System SHALL display a dashboard with KPIs for their assigned channel only
2. WHEN the dashboard loads THEN the System SHALL display: Revenue, Profit, Items Sold, and Profit Margin for the current period
3. WHEN a team leader views the dashboard THEN the System SHALL NOT display data from other channels
4. WHEN KPI data is updated in the system THEN the System SHALL reflect the changes on the dashboard within 5 seconds
5. WHEN a team leader accesses the dashboard THEN the System SHALL calculate KPIs based only on orders from their assigned channel

### Requirement 5: Track Orders Page

**User Story:** As a team leader, I want to view and track orders for my channel, so that I can monitor order status and fulfillment.

#### Acceptance Criteria

1. WHEN a team leader accesses the Track Orders page THEN the System SHALL display all orders for their assigned channel
2. WHEN the Track Orders page loads THEN the System SHALL display order details: order ID, customer, status, items, and channel
3. WHEN a team leader views the Track Orders page THEN the System SHALL NOT display orders from other channels
4. WHEN a team leader searches for an order THEN the System SHALL filter results to show only matching orders from their channel
5. WHEN an order status changes THEN the System SHALL update the Track Orders page to reflect the new status

### Requirement 6: Packing Queue Management

**User Story:** As a team leader, I want to manage orders in the packing queue, so that I can organize and track packing operations.

#### Acceptance Criteria

1. WHEN a team leader accesses the Packing Queue page THEN the System SHALL display all unpacked orders for their assigned channel
2. WHEN the Packing Queue page loads THEN the System SHALL display order details: order ID, customer, items, and quantities
3. WHEN a team leader marks an order as packed THEN the System SHALL update the order status to "packed" and remove it from the packing queue
4. WHEN a team leader views the Packing Queue THEN the System SHALL NOT display orders from other channels
5. WHEN a team leader attempts to pack an order THEN the System SHALL validate that all items are available before allowing the pack action

### Requirement 7: Warehouse Dispatch Management

**User Story:** As a team leader, I want to manage packed orders for dispatch, so that I can coordinate shipment operations.

#### Acceptance Criteria

1. WHEN a team leader accesses the Warehouse Dispatch page THEN the System SHALL display all packed orders ready for dispatch from their assigned channel
2. WHEN the Warehouse Dispatch page loads THEN the System SHALL display order details: order ID, customer, packed items, and tracking information
3. WHEN a team leader marks an order as dispatched THEN the System SHALL update the order status to "dispatched" and generate tracking information
4. WHEN a team leader views the Warehouse Dispatch page THEN the System SHALL NOT display orders from other channels
5. WHEN a team leader dispatches an order THEN the System SHALL record the dispatch timestamp and update inventory accordingly

### Requirement 8: Inventory Alerts

**User Story:** As a team leader, I want to view low stock alerts for my channel's stores, so that I can manage inventory levels.

#### Acceptance Criteria

1. WHEN a team leader accesses the Inventory Alerts page THEN the System SHALL display low stock items from stores assigned to their channel
2. WHEN the Inventory Alerts page loads THEN the System SHALL display: product name, current stock, low stock threshold, and store location
3. WHEN a team leader views inventory alerts THEN the System SHALL NOT display alerts from other channels' stores
4. WHEN inventory levels change THEN the System SHALL update alerts in real-time
5. WHEN stock reaches the low stock threshold THEN the System SHALL generate an alert for that product

### Requirement 9: Data Isolation and Access Control

**User Story:** As a system administrator, I want to ensure team leaders can only access their assigned channel's data, so that I can maintain data security and privacy.

#### Acceptance Criteria

1. WHEN a team leader attempts to access data from another channel THEN the System SHALL deny access and display an error message
2. WHEN a team leader makes an API request THEN the System SHALL filter results to include only their assigned channel's data
3. WHEN a team leader attempts to modify settings or create products THEN the System SHALL deny the action and display an error message
4. WHEN a team leader's session is active THEN the System SHALL enforce channel-based access control on all pages and API endpoints
5. WHEN a team leader logs out THEN the System SHALL clear their session and require re-authentication to access the dashboard

### Requirement 10: User Role and Permissions

**User Story:** As a system administrator, I want to define team leader roles with appropriate permissions, so that I can control what actions team leaders can perform.

#### Acceptance Criteria

1. WHEN a user is assigned the team_leader role THEN the System SHALL grant permissions to: view dashboard, track orders, manage packing queue, manage dispatch, and view inventory alerts
2. WHEN a team leader attempts to access admin functions THEN the System SHALL deny access and display an error message
3. WHEN a team leader attempts to create or modify products THEN the System SHALL deny the action
4. WHEN a team leader attempts to modify settings THEN the System SHALL deny the action
5. WHEN a user with admin role accesses the system THEN the System SHALL grant full access to all channels and settings

### Requirement 11: Database Schema Updates

**User Story:** As a developer, I want to update the database schema to support team leader functionality, so that I can store channel assignments and role information.

#### Acceptance Criteria

1. WHEN the system initializes THEN the users table SHALL have an assigned_channel field to store the team leader's channel
2. WHEN a user record is created THEN the assigned_channel field SHALL be set to the appropriate sales channel
3. WHEN the system initializes THEN the users table SHALL have a role field that supports values: admin, operations, team_leader
4. WHEN a team leader is created THEN the role field SHALL be set to team_leader
5. WHEN the system queries user data THEN the assigned_channel field SHALL be available for filtering and access control

