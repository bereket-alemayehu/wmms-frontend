# Tickets Feature

## Overview
The Tickets feature handles all functionality related to customer support tickets in the WMMS system.

## 📁 Folder Structure

```
features/tickets/
├── api/
│   └── ticket.ts              # Single API file with hardcoded auth token
├── types/
│   ├── ticket.ts              # Type definitions
│   └── index.ts               # Type exports
├── hooks/
│   ├── useTickets.ts          # Fetch all tickets
│   ├── useTicket.ts           # Fetch single ticket
│   ├── useCreateTicket.ts     # Create ticket mutation
│   ├── useUpdateTicket.ts     # Update ticket mutation
│   ├── useDeleteTicket.ts     # Delete ticket mutation
│   ├── useAssignTicket.ts     # Assign ticket mutation
│   ├── useRequestRefund.ts    # Request refund mutation
│   └── index.ts               # Hook exports
├── components/
│   ├── createTicketDialog.tsx # Create ticket modal
│   ├── ticketCard.tsx         # Ticket display card
│   └── index.ts               # Component exports
├── utils/                     # Utility functions (if needed)
└── README.md                  # This file
```

## 🔐 Authentication

**IMPORTANT:** This feature uses a **hardcoded Bearer token** for isolated testing.

- Token is defined as `AUTH_TOKEN` constant in `api/ticket.ts`
- Token is manually added to the `Authorization` header for every API call
- No dependency on global auth context during isolated testing

## 🌐 API Configuration

- **Base URL:** `http://localhost:3002/api`
- **Endpoint:** `/tickets`
- **Authentication:** Bearer token (hardcoded)

## 📊 Types

All types are defined in `types/ticket.ts`:

### Core Types
- `Ticket` - Main ticket interface
- `TicketCategory` - "Speed Issue" | "No Connection" | "Hardware Fault" | "Other"
- `TicketStatus` - "Pending" | "Assigned" | "In Progress" | "Resolved" | "Closed"

### Request Types
- `CreateTicketRequest` - Data for creating tickets
- `UpdateTicketRequest` - Data for updating tickets
- `AssignTicketRequest` - Data for assigning tickets
- `TicketFilters` - Query parameters for filtering tickets

### Response Types
- `TicketsListResponse` - API response for list
- `TicketResponse` - API response for single ticket

## 🎣 Hooks (React Query)

All hooks use React Query and centralized query keys from `@/lib/query-keys.ts`.

### Query Hooks

#### `useTickets(filters?: TicketFilters)`
Fetches list of tickets with optional filters.

```typescript
const { data: tickets, isLoading, error } = useTickets({ status: 'Pending' })
```

#### `useTicket(ticketId: string)`
Fetches a single ticket by ID.

```typescript
const { data: ticket, isLoading } = useTicket(ticketId)
```

### Mutation Hooks

#### `useCreateTicket()`
Creates a new ticket.

```typescript
const createTicket = useCreateTicket()

createTicket.mutate({
  category: 'No Connection',
  description: 'Internet not working',
  officeId: 'office123'
})
```

#### `useUpdateTicket()`
Updates an existing ticket.

```typescript
const updateTicket = useUpdateTicket()

updateTicket.mutate({
  id: 'ticket123',
  data: { status: 'Resolved', rating: 5 }
})
```

#### `useDeleteTicket()`
Deletes a ticket.

```typescript
const deleteTicket = useDeleteTicket()

deleteTicket.mutate('ticket123')
```

#### `useAssignTicket()`
Assigns a ticket to a technician.

```typescript
const assignTicket = useAssignTicket()

assignTicket.mutate({
  ticketId: 'ticket123',
  data: { technicianId: 'tech456' }
})
```

#### `useRequestRefund()`
Requests a refund for a ticket.

```typescript
const requestRefund = useRequestRefund()

requestRefund.mutate('ticket123')
```

## 🧩 Components

### `CreateTicketDialog`
Modal dialog for creating new tickets.

```typescript
<CreateTicketDialog
  offices={offices}
  defaultOfficeId={officeId}
/>
```

**Props:**
- `offices` - Array of office objects for selection
- `defaultOfficeId` - Pre-selected office ID

### `TicketCard`
Displays ticket information in a card format.

```typescript
<TicketCard
  ticket={ticket}
  showQueue={true}
  showCustomer={true}
  queuePosition={5}
  onAction={handleAction}
  actions={[
    { label: 'View', action: 'view', variant: 'outline' },
    { label: 'Resolve', action: 'resolve', variant: 'default' }
  ]}
/>
```

**Props:**
- `ticket` - Ticket object to display
- `showQueue` - Show queue position badge
- `showCustomer` - Show customer information
- `queuePosition` - Position in queue
- `onAction` - Callback for action buttons
- `actions` - Array of action button configs

## 🔄 Query Invalidation

All mutations automatically invalidate related queries:

- Create/Update/Delete → Invalidates `tickets.all` and `dashboard.stats()`
- Assign → Invalidates specific ticket + lists
- Request Refund → Invalidates tickets + refunds

## 🎯 Usage Examples

### Displaying Tickets List

```typescript
import { useTickets } from '@/features/tickets/hooks'
import { TicketCard } from '@/features/tickets/components'

function TicketsPage() {
  const { data: tickets, isLoading, error } = useTickets()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading tickets</div>

  return (
    <div className="grid gap-4">
      {tickets?.map(ticket => (
        <TicketCard key={ticket._id} ticket={ticket} />
      ))}
    </div>
  )
}
```

### Creating a Ticket

```typescript
import { CreateTicketDialog } from '@/features/tickets/components'

function MyComponent() {
  return <CreateTicketDialog offices={offices} />
}
```

### Updating Ticket Status

```typescript
import { useUpdateTicket } from '@/features/tickets/hooks'

function TicketActions({ ticketId }) {
  const updateTicket = useUpdateTicket()

  const handleResolve = () => {
    updateTicket.mutate({
      id: ticketId,
      data: { status: 'Resolved' }
    })
  }

  return (
    <button onClick={handleResolve}>
      Resolve Ticket
    </button>
  )
}
```

## 📝 Notes

- All file names use **camelCase**
- Components use **PascalCase** for component names but **camelCase** for file names
- API file is **singular** (`ticket.ts` not `tickets.ts`)
- All API calls include the hardcoded Bearer token
- Toast notifications are automatically shown for success/error states
- React Query handles caching and automatic refetching

## 🚀 Future Enhancements

- Add pagination support
- Add advanced filtering UI
- Add ticket history/timeline
- Add real-time updates via WebSocket
- Add file attachment support
- Add bulk operations (assign multiple tickets)

---

**Status:** ✅ Ready for Testing
**Last Updated:** January 22, 2026

