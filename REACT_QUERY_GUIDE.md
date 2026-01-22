# React Query Setup Guide

This document provides an overview of the React Query (TanStack Query) setup in the WMMS frontend application.

## What's Installed

- `@tanstack/react-query` (v5.62.11): Core React Query library
- `@tanstack/react-query-devtools`: Development tools for debugging queries

## Configuration

### Query Client Setup

The Query Client is configured in `src/lib/react-query.ts` with the following default options:

```typescript
{
  queries: {
    refetchOnWindowFocus: false,  // Don't refetch when window gains focus
    retry: 1,                      // Retry failed queries once
    staleTime: 5 * 60 * 1000,     // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000,       // Cache data for 10 minutes
  },
  mutations: {
    retry: 1,                      // Retry failed mutations once
  },
}
```

### Provider Setup

The `QueryClientProvider` is set up in `src/App.tsx` and wraps the entire application:

```tsx
<QueryClientProvider client={queryClient}>
  {/* Your app components */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Query Keys

Query keys are centralized in `src/lib/query-keys.ts` to maintain consistency across the application. This makes it easier to:
- Invalidate related queries
- Avoid key duplication
- Type-safe query key usage

### Example Usage:

```typescript
import { queryKeys } from '@/lib/query-keys'

// In your component or hook
const { data } = useQuery({
  queryKey: queryKeys.tickets.list({ status: 'open' }),
  queryFn: () => fetchTickets({ status: 'open' }),
})

// Invalidate all tickets
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })

// Invalidate specific ticket
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) })
```

## Using React Query in Your Components

### Fetching Data (Queries)

```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchTickets } from '@/features/tickets/api/tickets'

function TicketsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.tickets.lists(),
    queryFn: fetchTickets,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  )
}
```

### Mutating Data (Mutations)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createTicket } from '@/features/tickets/api/tickets'

function CreateTicketForm() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      // Invalidate and refetch tickets list
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
    },
  })

  const handleSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  )
}
```

## React Query Devtools

The React Query Devtools are automatically included in development mode. You can:

1. **Open Devtools**: Click the React Query logo button (bottom-right corner of the screen)
2. **View Queries**: See all active queries, their status, and cached data
3. **Refetch**: Manually refetch queries
4. **Invalidate**: Clear query caches
5. **Time Travel**: Inspect query history

The devtools will NOT appear in production builds.

## Best Practices

### 1. Always Use Centralized Query Keys
```typescript
// ✅ Good
queryKey: queryKeys.tickets.detail(id)

// ❌ Bad
queryKey: ['tickets', id]
```

### 2. Handle Loading and Error States
```typescript
const { data, isLoading, error, isError } = useQuery({...})

if (isLoading) return <Spinner />
if (isError) return <ErrorMessage error={error} />
```

### 3. Invalidate Related Queries After Mutations
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
}
```

### 4. Use Optimistic Updates for Better UX
```typescript
const mutation = useMutation({
  mutationFn: updateTicket,
  onMutate: async (newTicket) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.tickets.detail(id) })
    
    // Snapshot previous value
    const previousTicket = queryClient.getQueryData(queryKeys.tickets.detail(id))
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.tickets.detail(id), newTicket)
    
    return { previousTicket }
  },
  onError: (err, newTicket, context) => {
    // Rollback on error
    queryClient.setQueryData(
      queryKeys.tickets.detail(id),
      context.previousTicket
    )
  },
})
```

### 5. Use Suspense and Error Boundaries (Optional)
```typescript
const { data } = useQuery({
  queryKey: queryKeys.tickets.lists(),
  queryFn: fetchTickets,
  suspense: true, // Enable React Suspense
})
```

## Folder Structure for API Calls

Each feature should have an `api` folder with API functions:

```
src/features/
├── tickets/
│   ├── api/
│   │   └── tickets.ts      # API functions
│   ├── components/
│   └── hooks/
│       └── useTickets.ts   # Custom hooks using React Query
```

Example API file:
```typescript
// src/features/tickets/api/tickets.ts
import { api } from '@/lib/axios'

export const fetchTickets = async () => {
  const { data } = await api.get('/tickets')
  return data
}

export const createTicket = async (ticketData) => {
  const { data } = await api.post('/tickets', ticketData)
  return data
}
```

Example custom hook:
```typescript
// src/features/tickets/hooks/useTickets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchTickets, createTicket } from '../api/tickets'

export const useTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets.lists(),
    queryFn: fetchTickets,
  })
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
    },
  })
}
```

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query v5 Migration Guide](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/framework/react/devtools)

## Common Issues

### 1. Queries Not Updating After Mutation
Make sure to invalidate the related queries:
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
```

### 2. Stale Data
Adjust `staleTime` in the query options or globally in the Query Client config.

### 3. Too Many Refetches
Set `refetchOnWindowFocus: false` or adjust other refetch options.

---

**Note**: This setup is already configured and ready to use in the WMMS frontend application!

