# Bundle Product System - Requirements

**Feature Name**: bundle-product-system  
**Created**: 2026-03-06  
**Status**: Draft  
**Priority**: High

## Overview

The Bundle Product System allows the inventory system to manage product bundles - collections of multiple individual items sold together as a single unit. This feature enables virtual stock tracking, automatic component deduction, and comprehensive bundle analytics.

## Business Context

Currently, the system only supports simple products. When selling bundles (e.g., "Gaming Setup" = 1 Monitor + 1 Keyboard + 1 Mouse), staff must manually:
- Track which items are in each bundle
- Deduct individual components from inventory
- Calculate bundle pricing and profitability
- Monitor component availability

This manual process is error-prone and time-consuming. The Bundle Product System automates this workflow.

## User Stories

### US-1: Create Bundle Product (Admin)
**As an** admin user  
**I want to** create bundle products by selecting component items and quantities  
**So that** I can sell multiple items together as a package deal

**Acceptance Criteria:**
- AC-1.1: Admin can create a bundle with a name, SKU, and selling price
- AC-1.2: Admin can add multiple component items with specific quantities
- AC-1.3: System validates that all component items exist in inventory
- AC-1.4: System calculates total cost from component costs
- AC-1.5: System calculates profit margin automatically
- AC-1.6: Admin can choose between virtual stock (calculated) or manual stock tracking
- AC-1.7: Admin can add metadata (discount %, description, tags)
- AC-1.8: System prevents creating bundles with zero or negative quantities

### US-2: View Bundle Inventory (All Users)
**As a** user  
**I want to** view all bundle products with their available stock  
**So that** I can see what bundles are available to sell

**Acceptance Criteria:**
- AC-2.1: Users can see a list of all bundle products
- AC-2.2: Each bundle shows its name, SKU, selling price, and available stock
- AC-2.3: Virtual stock bundles show calculated availability based on components
- AC-2.4: System displays which component is the bottleneck (limiting stock)
- AC-2.5: Bundles with zero available stock are clearly marked
- AC-2.6: Users can filter bundles by sales channel and store

### US-3: Sell Bundle Product (Operations)
**As an** operations user  
**I want to** sell bundle products through the dispatch system  
**So that** component inventory is automatically deducted

**Acceptance Criteria:**
- AC-3.1: Operations can select bundle products in the dispatch form
- AC-3.2: System validates sufficient component stock before allowing sale
- AC-3.3: System deducts correct quantities from all component items
- AC-3.4: System creates audit trail of component deductions
- AC-3.5: System updates bundle available stock after sale
- AC-3.6: System prevents overselling (insufficient component stock)
- AC-3.7: Transaction records link to bundle sale for traceability

### US-4: Virtual Stock Calculation (System)
**As the** system  
**I want to** automatically calculate bundle availability from component stock  
**So that** stock levels are always accurate without manual updates

**Acceptance Criteria:**
- AC-4.1: System calculates max bundles possible from each component
- AC-4.2: System identifies the bottleneck component (lowest availability)
- AC-4.3: System updates virtual stock in real-time when components change
- AC-4.4: System shows component status for each bundle
- AC-4.5: Calculation considers component quantities per bundle

### US-5: Bundle Analytics (Admin)
**As an** admin  
**I want to** view bundle sales analytics and component usage  
**So that** I can optimize bundle offerings and pricing

**Acceptance Criteria:**
- AC-5.1: Admin can view total bundles sold per product
- AC-5.2: Admin can see total revenue and profit from bundles
- AC-5.3: Admin can view component usage statistics
- AC-5.4: Admin can see sales breakdown by channel
- AC-5.5: Admin can identify best-performing bundles
- AC-5.6: Analytics show profit margins and trends

### US-6: Bundle Validation (System)
**As the** system  
**I want to** validate bundle configurations before creation  
**So that** only valid bundles can be created

**Acceptance Criteria:**
- AC-6.1: System validates all component items exist
- AC-6.2: System validates component quantities are positive integers
- AC-6.3: System validates selling price is greater than total cost
- AC-6.4: System warns if profit margin is below threshold (e.g., 10%)
- AC-6.5: System prevents circular dependencies (bundle containing itself)
- AC-6.6: System validates sales channel and store exist

## Functional Requirements

### FR-1: Bundle Data Model
- Bundle products must have: id, name, SKU, product_type='bundle', components, pricing, stock settings
- Components must specify: item_id, quantity
- Support for bundle metadata: discount %, original price, description, tags
- Timestamps for creation and updates

### FR-2: Virtual Stock Management
- Calculate available stock from component availability
- Update automatically when component stock changes
- Support manual stock override option
- Display bottleneck component information

### FR-3: Component Deduction
- Atomic transaction for deducting all components
- Rollback if any component has insufficient stock
- Create audit trail in bundle_transactions table
- Link to main transaction/order record

### FR-4: Bundle API Endpoints
- GET /api/bundles - List all bundles
- GET /api/bundles/:id - Get bundle details
- POST /api/bundles - Create bundle (admin only)
- PATCH /api/bundles/:id - Update bundle (admin only)
- DELETE /api/bundles/:id - Delete bundle (admin only)
- POST /api/bundles/validate - Validate bundle config
- GET /api/bundles/:id/stock - Calculate virtual stock
- POST /api/bundles/sell - Sell bundle and deduct components
- GET /api/bundles/:id/analytics - Get bundle analytics

### FR-5: Integration with Existing Systems
- Integrate with warehouse dispatch page
- Show bundles in inventory list with special indicator
- Include bundles in dashboard statistics
- Support bundle sales in Track Orders page
- Include bundles in financial reports

## Non-Functional Requirements

### NFR-1: Performance
- Virtual stock calculation must complete in <100ms
- Bundle sale transaction must complete in <500ms
- Support up to 10 components per bundle
- Support up to 1000 active bundles

### NFR-2: Data Integrity
- Component deduction must be atomic (all or nothing)
- Prevent negative stock through validation
- Maintain referential integrity between bundles and components
- Audit trail for all bundle transactions

### NFR-3: Usability
- Clear visual distinction between simple and bundle products
- Intuitive bundle creation interface
- Real-time stock availability feedback
- Clear error messages for validation failures

### NFR-4: Security
- Only admins can create/edit/delete bundles
- All users can view bundles
- Operations can sell bundles
- Audit trail includes user information

## Technical Constraints

- Must use existing Supabase database
- Must follow existing API patterns (withAuth, withAdmin)
- Must integrate with existing caching system
- Must support existing authentication/authorization
- Must maintain backward compatibility with simple products

## Dependencies

- Existing inventory items (components must exist)
- Existing stores and sales channels
- Existing authentication system
- Existing transaction/order system
- Database migration 020_add_bundle_product_support.sql (already created)

## Success Metrics

- 100% of bundle sales correctly deduct all components
- Zero overselling incidents (insufficient component stock)
- Virtual stock calculation accuracy: 100%
- Bundle creation time: <30 seconds
- User adoption: 50% of product bundles migrated within 1 month

## Out of Scope (Future Enhancements)

- Bundle variants (size, color options)
- Dynamic bundle pricing based on component prices
- Bundle recommendations based on sales patterns
- Bulk bundle creation from CSV
- Bundle expiration dates
- Conditional bundles (buy X get Y)

## Questions & Assumptions

**Questions:**
1. Should bundles support nested bundles (bundle containing another bundle)?
2. What happens to bundle when a component is deleted?
3. Should we support partial bundle sales (sell components separately)?
4. How to handle bundle returns?

**Assumptions:**
1. Bundles cannot contain other bundles (only simple products)
2. Deleting a component should prevent bundle sales but not delete bundle
3. Bundles are sold as complete units only
4. Bundle returns follow same process as simple product returns

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Component stock deduction fails mid-transaction | High | Low | Use database transactions with rollback |
| Virtual stock calculation performance issues | Medium | Medium | Add caching, optimize queries |
| User confusion between simple and bundle products | Medium | Medium | Clear UI indicators, training |
| Data migration complexity | Low | Low | Existing products remain simple by default |

## Approval

- [ ] Product Owner Review
- [ ] Technical Lead Review
- [ ] Security Review
- [ ] UX Review

---

**Next Steps:**
1. Review and approve requirements
2. Create design document with technical architecture
3. Create implementation tasks
4. Implement API endpoints
5. Implement UI components
6. Testing and QA
7. Documentation and training
