# React Query Quick Start

## ✅ What's Already Set Up

React Query is fully configured in your WMMS frontend application:

1. ✅ `@tanstack/react-query` - Installed (v5.62.11)
2. ✅ `@tanstack/react-query-devtools` - Installed (v5.91.2)
3. ✅ QueryClient configured in `src/lib/react-query.ts`
4. ✅ QueryClientProvider wrapping app in `src/App.tsx`
5. ✅ React Query DevTools integrated (bottom-right corner in dev mode)
6. ✅ Centralized query keys in `src/lib/query-keys.ts`
7. ✅ Example hooks in `src/hooks/useQueryExample.ts`

## 🚀 Quick Usage

### 1. Fetch Data (useQuery)

```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.tickets.lists(),
    queryFn: async () => {
      const response = await fetch('/api/tickets')
      return response.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error!</div>
  return <div>{data.map(...)}</div>
}
```

### 2. Create/Update Data (useMutation)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

function CreateTicketButton() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      })
      return response.json()
    },
    onSuccess: () => {
      // Refresh tickets list after creating
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
    },
  })

  return (
    <button onClick={() => mutation.mutate({ title: 'New Ticket' })}>
      {mutation.isPending ? 'Creating...' : 'Create Ticket'}
    </button>
  )
}
```

## 📁 File Structure

```
wmms-frontend/src/
├── lib/
│   ├── react-query.ts       # QueryClient configuration
│   └── query-keys.ts        # Centralized query keys
├── hooks/
│   └── useQueryExample.ts   # Example hooks (templates)
└── features/
    └── [feature]/
        ├── api/
        │   └── [feature].ts  # API functions
        └── hooks/
            └── use[Feature].ts  # React Query hooks
```

## 🔑 Available Query Keys

```typescript
import { queryKeys } from '@/lib/query-keys'

// Auth
queryKeys.auth.user()
queryKeys.auth.profile()

// Tickets
queryKeys.tickets.all
queryKeys.tickets.lists()
queryKeys.tickets.list({ status: 'open' })
queryKeys.tickets.detail(ticketId)

// Outages
queryKeys.outages.all
queryKeys.outages.lists()
queryKeys.outages.detail(outageId)

// Refunds
queryKeys.refunds.all
queryKeys.refunds.lists()
queryKeys.refunds.detail(refundId)
queryKeys.refunds.user(userId)

// Dashboard
queryKeys.dashboard.stats()
queryKeys.dashboard.customerStats()
queryKeys.dashboard.technicianStats()

// Users/Technicians
queryKeys.users.lists()
queryKeys.users.detail(userId)
queryKeys.users.technicians()

// Tasks
queryKeys.tasks.lists()
queryKeys.tasks.detail(taskId)

// Analytics
queryKeys.analytics.overview()
queryKeys.analytics.performance()
```

## 🛠️ DevTools Usage

The React Query DevTools appear in the bottom-right corner of your screen in development mode:

1. **Click the icon** to open the devtools panel
2. **View queries**: See all active queries and their status
3. **Inspect data**: Click on a query to see cached data
4. **Refetch**: Click "Refetch" to manually refetch a query
5. **Clear cache**: Use "Remove" to clear cached data

## 🎯 Common Patterns

### Pattern 1: List + Detail Pages
```typescript
// List page
const { data: tickets } = useQuery({
  queryKey: queryKeys.tickets.lists(),
  queryFn: fetchTickets,
})

// Detail page
const { data: ticket } = useQuery({
  queryKey: queryKeys.tickets.detail(ticketId),
  queryFn: () => fetchTicket(ticketId),
  enabled: !!ticketId, // Only fetch if ticketId exists
})
```

### Pattern 2: Mutation with Toast Notification
```typescript
import { toast } from 'sonner'

const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => {
    toast.success('Ticket created successfully!')
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
  },
  onError: (error) => {
    toast.error('Failed to create ticket')
  },
})
```

### Pattern 3: Filtered Lists
```typescript
const [status, setStatus] = useState('open')

const { data } = useQuery({
  queryKey: queryKeys.tickets.list({ status }),
  queryFn: () => fetchTickets({ status }),
})
```

## 📚 Next Steps

1. Check `src/hooks/useQueryExample.ts` for complete examples
2. Read `REACT_QUERY_GUIDE.md` for detailed documentation
3. Start building your feature-specific hooks in `src/features/[feature]/hooks/`
4. Use the existing axios instance from `src/lib/axios.ts` for API calls

## 💡 Tips

- Always use centralized query keys from `queryKeys`
- Invalidate related queries after mutations
- Handle loading and error states
- Use the DevTools to debug query issues
- Keep API calls in separate files under `features/[feature]/api/`

---

**Everything is ready to use! Just import and start using React Query in your components! 🎉**

