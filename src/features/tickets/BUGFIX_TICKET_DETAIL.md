# Bug Fixes: Ticket Detail Page & Unauthorized API Calls

## Issues Fixed

### 1. Ticket Detail Page Showing "Query data cannot be undefined"
**Problem**: The ticket detail page was making successful API requests (200 OK) but React Query was showing "Query data cannot be undefined" error.

**Root Cause**: The `getTicketById` function was parsing the response as `response.data.data.ticket`, but the backend factory pattern returns `response.data.data.document`.

**Fix**: Updated `getTicketById` in `src/features/tickets/api/ticket.ts`:
```typescript
// Before
return response.data.data.ticket

// After
return response.data.data.document
```

**Files Changed**:
- `wmms-frontend/src/features/tickets/api/ticket.ts` (line 59)

---

### 2. Customer Users Getting 403 Errors for "Get All Tickets"
**Problem**: When logged in as a customer, the app was making unauthorized GET requests to `/api/v1/tickets`, resulting in 403 Forbidden errors.

**Root Cause**: In `TicketsPage.tsx`, all role-specific hooks were being called unconditionally, including `useTickets()` which requires supervisor/manager permissions. While this follows React's Rules of Hooks (hooks must be called unconditionally), it caused unnecessary API calls and 403 errors.

**Solution**: Added conditional enabling to ticket query hooks using React Query's `enabled` option. This allows all hooks to be called (satisfying Rules of Hooks) but prevents unauthorized API requests.

**Implementation**:

1. **Updated Hook Signatures** (`src/features/tickets/hooks/useTickets.ts`):
   ```typescript
   export const useCustomerTickets = (enabled: boolean = true) => { ... }
   export const useTechnicianTickets = (status?: string, enabled: boolean = true) => { ... }
   export const useOfficeTickets = (officeId?: string, status?: string, enabled: boolean = true) => { ... }
   export const useTickets = (filters?: TicketFilters, enabled: boolean = true) => { ... }
   ```

2. **Updated TicketsPage** (`src/pages/TicketsPage.tsx`):
   ```typescript
   // Only enable the hook relevant to the user's role
   const customerQuery = useCustomerTickets(role === "customer");
   const technicianQuery = useTechnicianTickets(undefined, role === "technician");
   const officeQuery = useOfficeTickets(user.officeId, undefined, role === "supervisor");
   const managerQuery = useTickets(undefined, role === "manager");
   ```

**Files Changed**:
- `wmms-frontend/src/features/tickets/hooks/useTickets.ts`
- `wmms-frontend/src/pages/TicketsPage.tsx`

---

## Testing Checklist

### Ticket Detail Page
- [x] Navigate to ticket detail page
- [x] Ticket data loads and displays correctly
- [x] No "Query data cannot be undefined" error in console
- [x] All ticket fields render properly (description, status, customer, technician, office, etc.)

### Role-Based API Calls
- [x] **Customer**: Only makes requests to `/api/v1/tickets/customer/my-tickets`
- [x] **Technician**: Only makes requests to `/api/v1/tickets/technician/my-tickets`
- [x] **Supervisor**: Only makes requests to `/api/v1/tickets/office/:officeId/tickets`
- [x] **Manager**: Only makes requests to `/api/v1/tickets`
- [x] No 403 errors for unauthorized endpoints

### Browser Console
- [x] No React Query errors
- [x] No 403 Forbidden errors (except for genuinely unauthorized actions)
- [x] Clean console output

---

## Technical Notes

### React Query `enabled` Option
The `enabled` option in React Query allows you to conditionally enable/disable a query without violating React's Rules of Hooks. When `enabled: false`:
- The query function is NOT called
- No API request is made
- The query remains in "idle" status
- Hook can still be called unconditionally (satisfying Rules of Hooks)

### Backend Response Format
The backend uses a factory pattern that returns data in this format:
```json
{
  "status": "success",
  "data": {
    "document": { /* ticket data */ }
  }
}
```

For list endpoints:
```json
{
  "status": "success",
  "results": 10,
  "data": {
    "tickets": [ /* array of tickets */ ]
  }
}
```

---

## Related Files
- API Layer: `src/features/tickets/api/ticket.ts`
- Hooks Layer: `src/features/tickets/hooks/useTickets.ts`
- Page Component: `src/pages/TicketDetailPage.tsx`
- List Page: `src/pages/TicketsPage.tsx`

---

**Date Fixed**: January 22, 2026
**Status**: ✅ Complete and tested

