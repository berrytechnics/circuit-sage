# MVP Hand Testing Plan

## Overview
This plan provides a systematic approach to hand-test every action and interaction in RepairForge before MVP completion. The plan is organized by feature area and includes role-based testing scenarios.

## Test Environment Setup

### Prerequisites
- Backend running on configured port (default: 5000)
- Frontend running on configured port (default: 3000)
- Database initialized with migrations
- Test data seeded (optional but recommended)

### Test Accounts Needed
Create test users for each role:
- **Admin**: Full access testing
- **Manager**: Manager-level permissions testing
- **Technician**: Technician-level permissions testing
- **Front Desk**: Front desk-level permissions testing

## Testing Checklist

### 1. Authentication & User Management

#### Login/Logout
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Logout functionality
- [ ] Session persistence (refresh page, still logged in)
- [ ] Session expiration handling
- [ ] Redirect to login when accessing protected routes while logged out

#### User Registration (if applicable)
- [ ] Register new user
- [ ] Validation errors on invalid input
- [ ] Email uniqueness validation

#### Password Management
- [ ] Change password (Settings > Account Settings)
- [ ] Password validation (strength requirements)
- [ ] Password change requires current password

#### User Profile
- [ ] View user profile (avatar dropdown)
- [ ] Update user information
- [ ] Theme toggle (light/dark mode)
- [ ] Location switching (if multiple locations available)

### 2. Dashboard

#### Dashboard Access
- [ ] Dashboard loads for authenticated users
- [ ] Dashboard redirects unauthenticated users
- [ ] Dashboard shows correct data based on user location

#### Dashboard Metrics
- [ ] Total tickets count displays correctly
- [ ] Open tickets count displays correctly
- [ ] Total customers count displays correctly
- [ ] Revenue metrics display correctly (admin/manager only)
- [ ] Recent tickets list displays
- [ ] Revenue chart displays (admin/manager only)
- [ ] Date range filtering works (if applicable)

#### Dashboard Interactions
- [ ] Click ticket from recent tickets navigates to ticket detail
- [ ] Click customer from recent customers navigates to customer detail
- [ ] Refresh data updates metrics

### 3. Customer Management

#### Customer List
- [ ] View customer list
- [ ] Search customers by name
- [ ] Search customers by email
- [ ] Search customers by phone
- [ ] Search results update as you type
- [ ] Pagination works (if implemented)
- [ ] Empty state displays when no customers

#### Create Customer
- [ ] Navigate to create customer page
- [ ] Fill all required fields (first name, last name, email, phone)
- [ ] Fill optional fields (address, notes)
- [ ] Validation errors display for missing required fields
- [ ] Email format validation
- [ ] Phone format validation
- [ ] Save customer successfully
- [ ] Redirect to customer detail after creation
- [ ] Customer appears in customer list

#### View Customer Detail
- [ ] Click customer from list navigates to detail
- [ ] Customer information displays correctly
- [ ] Customer ticket history displays
- [ ] Customer invoice history displays
- [ ] Links to tickets work
- [ ] Links to invoices work

#### Edit Customer
- [ ] Navigate to edit customer page
- [ ] Pre-filled form with existing data
- [ ] Update customer information
- [ ] Save changes successfully
- [ ] Changes reflect in customer detail view
- [ ] Changes reflect in customer list

#### Delete Customer
- [ ] Delete customer (admin only)
- [ ] Confirmation dialog appears
- [ ] Customer soft-deleted (removed from list)
- [ ] Customer tickets still accessible
- [ ] Customer invoices still accessible

#### Permission Testing
- [ ] Admin: Can create, read, update, delete
- [ ] Manager: Can create, read, update (no delete)
- [ ] Technician: Can read only
- [ ] Front Desk: Can create, read, update (no delete)

### 4. Ticket Management

#### Ticket List
- [ ] View ticket list
- [ ] Filter tickets by status
- [ ] Filter tickets by priority
- [ ] Filter tickets by location
- [ ] Search tickets
- [ ] Sort tickets (if implemented)
- [ ] Pagination works (if implemented)

#### Create Ticket
- [ ] Navigate to create ticket page
- [ ] Select existing customer from dropdown
- [ ] Create new customer from ticket form (if applicable)
- [ ] Fill device description
- [ ] Fill issue description
- [ ] Select priority (Low, Medium, High, Urgent)
- [ ] Select location
- [ ] Validation errors for missing required fields
- [ ] Save ticket successfully
- [ ] Ticket number auto-generated (TKT-XXXX)
- [ ] Redirect to ticket detail after creation
- [ ] Ticket appears in ticket list

#### View Ticket Detail
- [ ] Click ticket from list navigates to detail
- [ ] Ticket information displays correctly
- [ ] Customer information displays correctly
- [ ] Status displays correctly
- [ ] Priority displays correctly
- [ ] Assigned technician displays (if assigned)
- [ ] Diagnostic notes section displays
- [ ] Repair notes section displays
- [ ] Ticket history/timeline displays (if implemented)

#### Update Ticket
- [ ] Update ticket information
- [ ] Update device description
- [ ] Update issue description
- [ ] Update priority
- [ ] Save changes successfully
- [ ] Changes reflect in ticket detail view

#### Update Ticket Status
- [ ] Change status via dropdown
- [ ] All statuses available: New, In Progress, Waiting for Parts, Ready for Pickup, Completed, Cancelled
- [ ] Status updates immediately
- [ ] Status change reflects in ticket list
- [ ] Completed date sets when status changed to Completed

#### Assign Technician
- [ ] Assign technician to ticket
- [ ] Technician dropdown shows available technicians
- [ ] Assignment saves successfully
- [ ] Assigned technician displays in ticket detail
- [ ] Unassign technician (select "None")
- [ ] Assignment removed successfully

#### Add Diagnostic Notes
- [ ] Add diagnostic notes to ticket
- [ ] Notes save successfully
- [ ] Notes display in ticket detail
- [ ] Notes timestamp displays correctly
- [ ] Notes author displays correctly

#### Add Repair Notes
- [ ] Add repair notes to ticket
- [ ] Notes save successfully
- [ ] Notes display in ticket detail
- [ ] Notes timestamp displays correctly
- [ ] Notes author displays correctly

#### Delete Ticket
- [ ] Delete ticket (admin only)
- [ ] Confirmation dialog appears
- [ ] Ticket soft-deleted (removed from list)
- [ ] Related invoices still accessible

#### Permission Testing
- [ ] Admin: Full access (create, read, update, assign, status, notes, delete)
- [ ] Manager: Can read, assign, update status (no create, update, notes, delete)
- [ ] Technician: Can create, read, update, update status, add notes (no assign, delete)
- [ ] Front Desk: Can create, read (no update, assign, status, notes, delete)

### 5. Invoice Management

#### Invoice List
- [ ] View invoice list
- [ ] Filter invoices by status (Paid, Unpaid, Overdue)
- [ ] Filter invoices by date range
- [ ] Filter invoices by location
- [ ] Search invoices
- [ ] Sort invoices (if implemented)
- [ ] Pagination works (if implemented)

#### Create Invoice
- [ ] Navigate to create invoice page
- [ ] Select customer from dropdown
- [ ] Set invoice date (defaults to today)
- [ ] Set due date
- [ ] Select location
- [ ] Validation errors for missing required fields
- [ ] Save invoice successfully
- [ ] Invoice number auto-generated (INV-XXXX)
- [ ] Redirect to invoice detail after creation
- [ ] Invoice appears in invoice list

#### View Invoice Detail
- [ ] Click invoice from list navigates to detail
- [ ] Invoice information displays correctly
- [ ] Customer information displays correctly
- [ ] Invoice items list displays
- [ ] Subtotal calculates correctly
- [ ] Tax calculates correctly
- [ ] Total calculates correctly
- [ ] Invoice status displays correctly
- [ ] Payment information displays (if paid)

#### Add Invoice Item
- [ ] Add item to invoice
- [ ] Fill item description
- [ ] Set quantity
- [ ] Set unit price
- [ ] Set tax rate (if applicable)
- [ ] Mark item as taxable/non-taxable
- [ ] Save item successfully
- [ ] Item appears in invoice items list
- [ ] Subtotal updates automatically
- [ ] Tax updates automatically
- [ ] Total updates automatically

#### Edit Invoice Item
- [ ] Edit existing invoice item
- [ ] Update item description
- [ ] Update quantity
- [ ] Update unit price
- [ ] Update tax rate
- [ ] Save changes successfully
- [ ] Calculations update automatically

#### Remove Invoice Item
- [ ] Remove invoice item
- [ ] Confirmation dialog appears (if applicable)
- [ ] Item removed successfully
- [ ] Calculations update automatically

#### Mark Invoice as Paid
- [ ] Mark invoice as paid
- [ ] Payment method selection (if applicable)
- [ ] Payment notes field (if applicable)
- [ ] Payment date sets automatically
- [ ] Invoice status updates to "Paid"
- [ ] Paid invoice appears in paid filter

#### Update Invoice
- [ ] Update invoice information
- [ ] Update invoice date
- [ ] Update due date
- [ ] Save changes successfully
- [ ] Changes reflect in invoice detail view

#### Delete Invoice
- [ ] Delete invoice (admin only)
- [ ] Confirmation dialog appears
- [ ] Invoice soft-deleted (removed from list)

#### Permission Testing
- [ ] Admin: Full access (create, read, update, delete, manage items, mark paid)
- [ ] Manager: Can create, read, update, manage items, mark paid (no delete)
- [ ] Technician: Can read only
- [ ] Front Desk: No access to invoices

### 6. Inventory Management

#### Inventory List
- [ ] View inventory list
- [ ] Filter inventory by category
- [ ] Filter inventory by location
- [ ] Search inventory items
- [ ] Low stock items highlighted
- [ ] Pagination works (if implemented)

#### Create Inventory Item
- [ ] Navigate to create inventory item page
- [ ] Fill item name
- [ ] Fill SKU (optional)
- [ ] Select category
- [ ] Set quantity
- [ ] Set unit cost
- [ ] Set reorder threshold
- [ ] Select location
- [ ] Validation errors for missing required fields
- [ ] Save item successfully
- [ ] Item appears in inventory list

#### View Inventory Item Detail
- [ ] Click item from list navigates to detail
- [ ] Item information displays correctly
- [ ] Quantity displays correctly
- [ ] Cost information displays correctly
- [ ] Location displays correctly

#### Update Inventory Item
- [ ] Update item information
- [ ] Update quantity
- [ ] Update unit cost
- [ ] Update reorder threshold
- [ ] Save changes successfully
- [ ] Changes reflect in inventory detail view

#### Delete Inventory Item
- [ ] Delete inventory item (admin/manager only)
- [ ] Confirmation dialog appears
- [ ] Item deleted successfully

#### Permission Testing
- [ ] Admin: Full access (create, read, update, delete)
- [ ] Manager: Full access (create, read, update, delete)
- [ ] Technician: Read only
- [ ] Front Desk: Read only

### 7. Purchase Orders

#### Purchase Order List
- [ ] View purchase order list
- [ ] Filter by status (Ordered, Received, Cancelled)
- [ ] Filter by location
- [ ] Search purchase orders
- [ ] Pagination works (if implemented)

#### Create Purchase Order
- [ ] Navigate to create purchase order page
- [ ] Fill supplier information
- [ ] Set order date
- [ ] Set expected delivery date
- [ ] Select location
- [ ] Add items to purchase order
- [ ] Fill item details (description, quantity, unit cost)
- [ ] Save item
- [ ] Multiple items can be added
- [ ] Validation errors for missing required fields
- [ ] Save purchase order successfully
- [ ] Purchase order number auto-generated (if applicable)
- [ ] Redirect to purchase order detail after creation

#### View Purchase Order Detail
- [ ] Click purchase order from list navigates to detail
- [ ] Purchase order information displays correctly
- [ ] Supplier information displays correctly
- [ ] Items list displays correctly
- [ ] Total cost calculates correctly
- [ ] Status displays correctly

#### Receive Purchase Order
- [ ] Receive purchase order (status: Ordered)
- [ ] Verify received quantities
- [ ] Update quantities if different from ordered
- [ ] Confirm receipt
- [ ] Purchase order status updates to "Received"
- [ ] Inventory quantities update automatically
- [ ] Received items appear in inventory

#### Cancel Purchase Order
- [ ] Cancel purchase order
- [ ] Add cancellation reason (if applicable)
- [ ] Confirm cancellation
- [ ] Purchase order status updates to "Cancelled"

#### Update Purchase Order
- [ ] Update purchase order information
- [ ] Update supplier information
- [ ] Update dates
- [ ] Add items
- [ ] Remove items
- [ ] Save changes successfully

#### Delete Purchase Order
- [ ] Delete purchase order (admin only)
- [ ] Confirmation dialog appears
- [ ] Purchase order deleted successfully

#### Permission Testing
- [ ] Admin: Full access (create, read, update, receive, cancel, delete)
- [ ] Manager: Can create, read, update, receive, cancel (no delete)
- [ ] Technician: Read only
- [ ] Front Desk: Read only

### 8. Inventory Transfers

#### Inventory Transfer List
- [ ] View inventory transfer list
- [ ] Filter by status
- [ ] Filter by location
- [ ] Search transfers
- [ ] Pagination works (if implemented)

#### Create Inventory Transfer
- [ ] Navigate to create inventory transfer page
- [ ] Select source location
- [ ] Select destination location
- [ ] Add items to transfer
- [ ] Select inventory item
- [ ] Set quantity
- [ ] Validation errors for missing required fields
- [ ] Save transfer successfully
- [ ] Transfer appears in transfer list

#### Complete Inventory Transfer
- [ ] Complete inventory transfer
- [ ] Verify quantities
- [ ] Confirm completion
- [ ] Transfer status updates to "Completed"
- [ ] Source location inventory decreases
- [ ] Destination location inventory increases

#### Cancel Inventory Transfer
- [ ] Cancel inventory transfer
- [ ] Add cancellation reason (if applicable)
- [ ] Confirm cancellation
- [ ] Transfer status updates to "Cancelled"

#### Permission Testing
- [ ] Admin: Full access (create, read, complete, cancel)
- [ ] Manager: Full access (create, read, complete, cancel)
- [ ] Technician: Read only
- [ ] Front Desk: Read only

### 9. Locations

#### Location List
- [ ] View location list
- [ ] Search locations
- [ ] Pagination works (if implemented)

#### Create Location
- [ ] Navigate to create location page
- [ ] Fill location name
- [ ] Fill address
- [ ] Fill contact information
- [ ] Set tax rate (if applicable)
- [ ] Validation errors for missing required fields
- [ ] Save location successfully
- [ ] Location appears in location list

#### View Location Detail
- [ ] Click location from list navigates to detail
- [ ] Location information displays correctly
- [ ] Location settings display correctly

#### Edit Location
- [ ] Update location information
- [ ] Update address
- [ ] Update contact information
- [ ] Update tax rate
- [ ] Save changes successfully

#### Permission Testing
- [ ] Admin: Full access (create, read, update, delete)
- [ ] Other roles: Read only (verify based on implementation)

### 10. Assets

#### Asset List
- [ ] View asset list
- [ ] Filter assets by location
- [ ] Filter assets by category
- [ ] Search assets
- [ ] Pagination works (if implemented)

#### Create Asset
- [ ] Navigate to create asset page
- [ ] Fill asset name
- [ ] Fill asset description
- [ ] Select location
- [ ] Select category
- [ ] Set purchase date
- [ ] Set purchase price
- [ ] Validation errors for missing required fields
- [ ] Save asset successfully
- [ ] Asset appears in asset list

#### View Asset Detail
- [ ] Click asset from list navigates to detail
- [ ] Asset information displays correctly
- [ ] Location displays correctly

#### Edit Asset
- [ ] Update asset information
- [ ] Update description
- [ ] Update location
- [ ] Save changes successfully

#### Delete Asset
- [ ] Delete asset (admin only)
- [ ] Confirmation dialog appears
- [ ] Asset deleted successfully

### 11. Payments

#### Payment Processing
- [ ] Process payment for invoice
- [ ] Select payment method
- [ ] Enter payment amount (or use full amount)
- [ ] Payment integration configured check
- [ ] Process payment successfully
- [ ] Invoice status updates to "Paid"
- [ ] Payment reference recorded
- [ ] Payment method recorded

#### Payment Refund
- [ ] Refund a payment
- [ ] Enter transaction ID
- [ ] Enter refund amount (or use full amount)
- [ ] Add refund reason (optional)
- [ ] Process refund successfully
- [ ] Refund recorded on invoice
- [ ] Refund amount tracked

#### Terminal Checkout (Square)
- [ ] Create terminal checkout for invoice
- [ ] Select device ID
- [ ] Enter amount
- [ ] Checkout created successfully
- [ ] Checkout ID returned
- [ ] Check checkout status
- [ ] Payment completes via terminal
- [ ] Invoice updates automatically

#### Payment Webhooks
- [ ] Webhook endpoint accessible
- [ ] Square webhook processes correctly
- [ ] Stripe webhook processes correctly
- [ ] PayPal webhook processes correctly
- [ ] Invoice updates from webhook

#### Permission Testing
- [ ] Admin: Can process payments, refunds, configure
- [ ] Manager: Can process payments, refunds (no configure)
- [ ] Technician: No payment access
- [ ] Front Desk: No payment access

### 12. Settings

#### Account Settings
- [ ] View account settings
- [ ] Update user information
- [ ] Change password
- [ ] Save changes successfully

#### Company Settings
- [ ] View company settings (admin only)
- [ ] Update company name
- [ ] Update company information
- [ ] Update currency settings
- [ ] Save changes successfully

#### Email Integration Settings
- [ ] Navigate to email integration settings (admin only)
- [ ] View current email integration status
- [ ] Configure SendGrid integration
- [ ] Enter API key
- [ ] Test connection
- [ ] Save integration successfully
- [ ] Integration status updates
- [ ] Masked credentials display correctly
- [ ] Delete integration

#### Payment Integration Settings
- [ ] Navigate to payment integration settings (admin only)
- [ ] View current payment integration status
- [ ] Configure Square integration
- [ ] Enter access token, application ID, location ID
- [ ] Test connection
- [ ] Save integration successfully
- [ ] Configure Stripe integration
- [ ] Enter API key
- [ ] Test connection
- [ ] Save integration successfully
- [ ] Configure PayPal integration
- [ ] Enter client ID and secret
- [ ] Test connection
- [ ] Save integration successfully
- [ ] Switch between payment providers
- [ ] Delete integration

#### Permissions Management
- [ ] Navigate to permissions page (admin only)
- [ ] View permissions matrix
- [ ] View permissions by role
- [ ] Customize role permissions (if implemented)
- [ ] Save permission changes

#### Diagnostic Checklists
- [ ] Navigate to diagnostic checklists (admin only)
- [ ] View checklist list
- [ ] Create new checklist
- [ ] Add items to checklist
- [ ] Edit checklist
- [ ] Delete checklist
- [ ] Use checklist in ticket (if implemented)

#### User Management
- [ ] View user list (admin only)
- [ ] Create new user
- [ ] Assign role to user
- [ ] Assign location to user
- [ ] Update user information
- [ ] Delete user (if implemented)
- [ ] Send invitation (if implemented)

### 13. Reporting

#### Reports Access
- [ ] Navigate to reports page
- [ ] Reports page loads for authenticated users
- [ ] Permission-based access (admin/manager see financial reports)

#### Report Filters
- [ ] Set date range (start date, end date)
- [ ] Select location filter
- [ ] Filters apply to all charts
- [ ] "All Locations" option (admin/manager only)

#### Ticket Status Distribution Chart
- [ ] Chart displays correctly
- [ ] Data loads for selected date range
- [ ] Data filters by location
- [ ] Chart updates when filters change
- [ ] Loading state displays
- [ ] Error state displays (if error occurs)

#### Ticket Priority Distribution Chart
- [ ] Chart displays correctly
- [ ] Data loads for selected date range
- [ ] Data filters by location
- [ ] Chart updates when filters change

#### Revenue by Location Chart
- [ ] Chart displays (admin/manager only)
- [ ] Data loads for selected date range
- [ ] All locations included
- [ ] Chart updates when filters change

#### Technician Performance Chart
- [ ] Chart displays (admin/manager only)
- [ ] Data loads for selected date range
- [ ] Data filters by location
- [ ] Performance metrics display correctly
- [ ] Chart updates when filters change

#### Invoice Status Breakdown Chart
- [ ] Chart displays (admin/manager/technician)
- [ ] Data loads for selected date range
- [ ] Data filters by location
- [ ] Chart updates when filters change

#### Permission Testing
- [ ] Admin: Can view all reports
- [ ] Manager: Can view all reports
- [ ] Technician: Can view ticket and invoice reports only
- [ ] Front Desk: Can view ticket reports only (verify based on implementation)

### 14. Multi-Tenancy & Location Context

#### Location Switching
- [ ] Switch location via location selector
- [ ] Current location displays correctly
- [ ] Data filters by selected location
- [ ] Dashboard updates for selected location
- [ ] Tickets filter by location
- [ ] Customers filter by location
- [ ] Invoices filter by location
- [ ] Inventory filters by location

#### Tenant Isolation
- [ ] Users from Company A cannot see Company B data
- [ ] Users from Location A cannot see Location B data (unless permitted)
- [ ] API requests include correct company/location context
- [ ] Cross-tenant data access blocked

### 15. Error Handling & Edge Cases

#### Form Validation
- [ ] Required field validation
- [ ] Email format validation
- [ ] Phone format validation
- [ ] Date validation
- [ ] Number validation
- [ ] Character length limits
- [ ] Special character handling

#### Error Messages
- [ ] Network error handling
- [ ] 404 error handling
- [ ] 403 error handling (permission denied)
- [ ] 401 error handling (unauthorized)
- [ ] 500 error handling (server error)
- [ ] Validation error messages display correctly
- [ ] Error messages are user-friendly

#### Edge Cases
- [ ] Empty states display correctly
- [ ] Large datasets handle correctly
- [ ] Special characters in names/data
- [ ] Very long text fields
- [ ] Concurrent updates handling
- [ ] Deleted record access (soft delete)

### 16. UI/UX Testing

#### Navigation
- [ ] Sidebar navigation works
- [ ] Active page highlighted in sidebar
- [ ] Navigation items show/hide based on permissions
- [ ] Breadcrumbs work (if implemented)
- [ ] Back button works

#### Responsive Design
- [ ] Mobile view works correctly
- [ ] Tablet view works correctly
- [ ] Desktop view works correctly
- [ ] Sidebar collapses on mobile
- [ ] Forms are usable on mobile

#### Theme
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Theme toggle works
- [ ] Theme persists across sessions
- [ ] All components support both themes

#### Loading States
- [ ] Loading spinners display during data fetch
- [ ] Skeleton screens display (if implemented)
- [ ] Loading states don't block UI unnecessarily

#### Notifications
- [ ] Success messages display
- [ ] Error messages display
- [ ] Notifications dismiss correctly
- [ ] Toast notifications work (if implemented)

### 17. Integration Testing

#### Email Integration
- [ ] Send test email via SendGrid
- [ ] Email integration test passes
- [ ] Email sending works from application (if implemented)

#### Payment Integration
- [ ] Square integration test passes
- [ ] Stripe integration test passes
- [ ] PayPal integration test passes
- [ ] Payment processing works end-to-end
- [ ] Refund processing works end-to-end

### 18. Performance Testing

#### Page Load Times
- [ ] Dashboard loads quickly
- [ ] List pages load quickly
- [ ] Detail pages load quickly
- [ ] Large lists paginate correctly

#### Data Fetching
- [ ] API calls complete in reasonable time
- [ ] No unnecessary API calls
- [ ] Data caching works (if implemented)

### 19. Security Testing

#### Authentication
- [ ] JWT tokens expire correctly
- [ ] Invalid tokens rejected
- [ ] Token refresh works (if implemented)

#### Authorization
- [ ] Permission checks work correctly
- [ ] Unauthorized actions blocked
- [ ] API endpoints protected correctly

#### Data Protection
- [ ] Sensitive data encrypted
- [ ] Credentials masked in UI
- [ ] SQL injection prevention
- [ ] XSS prevention

### 20. Browser Compatibility

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Feature Support
- [ ] All features work in all browsers
- [ ] No console errors
- [ ] No visual glitches

## Test Execution Notes

### Test Data Preparation
Before starting testing, ensure you have:
- Test customers (various scenarios)
- Test tickets (various statuses and priorities)
- Test invoices (paid and unpaid)
- Test inventory items (various categories)
- Test purchase orders (various statuses)
- Multiple locations (if testing multi-location)
- Multiple users with different roles

### Testing Order Recommendation
1. Authentication & User Management
2. Dashboard
3. Customer Management
4. Ticket Management
5. Invoice Management
6. Inventory Management
7. Purchase Orders
8. Inventory Transfers
9. Locations & Assets
10. Payments
11. Settings & Integrations
12. Reporting
13. Multi-tenancy & Permissions
14. Error Handling & Edge Cases
15. UI/UX & Browser Compatibility

### Documentation
- Document any bugs found with:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots (if applicable)
  - Browser/OS information

### Sign-off Criteria
All items in this checklist should be tested and verified before MVP sign-off. Any critical bugs should be fixed before proceeding.



