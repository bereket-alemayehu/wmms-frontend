# Ticket Detail Page Implementation

## Overview
A comprehensive, full-page ticket detail view with role-based interactions that replace the previous modal-based approach.

## Location
- **Page Component**: `src/pages/TicketDetailPage.tsx`
- **Route**: `/dashboard/tickets/:id`

## Features Implemented

### 1. Data Fetching
The page uses multiple React Query hooks to fetch real-time data:

- **`useTicket(id)`** - Fetches the main ticket details
- **`useTicketQueuePosition(id)`** - Gets the ticket's position in the queue
- **`useRefundEligibility(id)`** - Checks if the ticket is eligible for refund

### 2. Mutations (Actions)
The page supports various actions through mutation hooks:

- **`useUpdateTicket()`** - Update ticket details (description, category)
- **`useChangeTicketStatus()`** - Change ticket status
- **`useSubmitFeedback()`** - Submit customer feedback with rating
- **`useRequestRefund()`** - Request a refund for eligible tickets

### 3. Role-Based Permissions

#### Customer (`role: "customer"`)
- View ticket details
- View queue position (if pending/assigned)
- Edit description (if not closed)
- Submit feedback (if resolved/closed and no existing feedback)
- Request refund (if eligible and not already requested)

#### Technician (`role: "technician"`)
- View ticket details
- Edit description
- Change ticket status (Assigned → In Progress → Resolved → Closed)

#### Supervisor/Manager (`role: "supervisor" | "manager"`)
- All technician permissions
- Assign tickets to technicians (future enhancement)
- Full ticket management capabilities

### 4. UI Components

#### Header Section
- Back button to return to tickets list
- Ticket ID (last 8 characters)
- Current status badge with color coding

#### Queue Position Card (Customers Only)
- Displays when ticket is in "Pending" status
- Shows position in queue
- Helpful context message

#### Main Content (Left Column - 2/3 width)

**Issue Information Card**
- Category badge
- Description with edit capability (for authorized users)
- Save/Cancel actions when editing

**Status Change Card** (Technicians/Supervisors/Managers)
- Dropdown to select new status
- Update button with loading state
- Available statuses: Assigned, In Progress, Resolved, Closed

**Submit Feedback Card** (Customers on Resolved/Closed tickets)
- 5-star rating system (interactive)
- Optional feedback comment
- Submit with validation

**Existing Feedback Card** (If feedback already submitted)
- Star rating display
- Feedback comment (if provided)

#### Sidebar (Right Column - 1/3 width)

**Timeline Card**
- Created date and time
- Last updated date and time
- Days open (with warning badge if > 7 days)

**People Card**
- Customer name and phone number
- Assigned technician (or "Not assigned yet")
- Technician phone number (if assigned)

**Office Card**
- Branch name
- Location address

**Refund Status Card** (If applicable)
- Eligibility indicator
- Request refund button (if eligible and customer)
- "Refund Requested" badge (if already requested)

### 5. Loading and Error States

**Loading State**
- Skeleton loaders for header, cards, and content
- Consistent spacing maintained

**Error State**
- Error card with descriptive message
- Back button to return to tickets list
- Proper error message from backend

**Invalid ID**
- Automatic redirect to tickets list

### 6. Navigation
- Clicking on any `TicketCard` navigates to `/dashboard/tickets/:id`
- Back button returns to `/dashboard/tickets`
- Integrated with React Router

## Backend Integration

### API Endpoints Used
```typescript
// Base URL: http://localhost:3002/api/v1

GET    /tickets/:id                    // Get ticket details
GET    /tickets/:id/queue-position     // Get queue position
GET    /tickets/:id/refund-eligibility // Check refund eligibility
PATCH  /tickets/:id                    // Update ticket
PATCH  /tickets/:id/status             // Change status
POST   /tickets/:id/feedback           // Submit feedback
POST   /tickets/:id/request-refund     // Request refund
```

### Role-Based Access Control (Backend)
- All authenticated users: GET ticket, queue position, refund eligibility
- Technicians, Supervisors, Managers: PATCH ticket, change status
- Supervisors, Managers: Assign ticket
- Managers only: DELETE ticket
- All authenticated users: Submit feedback, request refund

## Technical Details

### Authentication
- Uses hardcoded Bearer token from `src/features/tickets/api/ticket.ts`
- Token included in all API requests via Authorization header

### State Management
- Local state for UI interactions (editing, feedback form)
- React Query for server state (fetching, caching, mutations)
- Automatic cache invalidation after mutations

### Responsive Design
- 2-column layout on desktop (2/3 content, 1/3 sidebar)
- Stacks vertically on mobile
- Scrollable content area with max viewport height

### User Experience
- Loading states with spinners
- Success/error toasts for all actions
- Disabled states during mutations
- Form validation before submission
- Automatic data refresh after mutations

## File Structure
```
src/
├── pages/
│   └── TicketDetailPage.tsx       # Main page component
└── features/tickets/
    ├── components/
│   ├── ticketCard.tsx             # Updated to navigate to detail page
│   ├── createTicketDialog.tsx     # Create ticket dialog
│   └── index.ts
├── hooks/
│   ├── useTicket.ts               # Fetch single ticket
│   ├── useTicketQueuePosition.ts  # Fetch queue position
│   ├── useRefundEligibility.ts    # Check refund eligibility
│   ├── useUpdateTicket.ts         # Update mutation
│   ├── useChangeTicketStatus.ts   # Status change mutation
│   ├── useSubmitFeedback.ts       # Feedback mutation
│   ├── useRequestRefund.ts        # Refund request mutation
│   └── index.ts
└── api/
    └── ticket.ts                  # All API functions
```

## Migration from Modal
- Removed `ticketDetailDialog.tsx` component
- Updated `ticketCard.tsx` to navigate instead of opening modal
- Changed from Dialog component to full-page layout
- Improved UX with dedicated page and better information architecture

## Future Enhancements
1. Add ticket assignment UI for supervisors/managers
2. Add ticket history/activity log
3. Add file attachments support
4. Add real-time updates via WebSockets
5. Add ticket comments/notes system
6. Add print ticket functionality
7. Add ticket export (PDF)

## Testing Checklist
- [ ] Customer can view their own tickets
- [ ] Customer can see queue position for pending tickets
- [ ] Customer can submit feedback on resolved/closed tickets
- [ ] Customer can request refund when eligible
- [ ] Technician can change ticket status
- [ ] Supervisor/Manager can access all tickets
- [ ] Loading states work correctly
- [ ] Error states display properly
- [ ] Navigation works (to detail, back to list)
- [ ] All mutations trigger success toasts
- [ ] Failed mutations show error toasts
- [ ] Data refreshes after mutations

## Code Examples

### Navigating to Ticket Detail
```typescript
// From TicketCard component
navigate(`/dashboard/tickets/${ticket._id}`)
```

### Using in Custom Components
```typescript
import { TicketDetailPage } from '@/features/tickets/pages'

// Already integrated in App.tsx routing
```

### Role-Based Rendering
```typescript
const isCustomer = user?.role === "customer"
const canChangeStatus = isTechnician || isSupervisor || isManager

{canChangeStatus && (
  <Card>
    {/* Status change UI */}
  </Card>
)}
```

---

**Last Updated**: Implementation completed with full role-based permissions and real-time data integration.

