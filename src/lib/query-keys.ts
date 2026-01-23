/**
 * Centralized query keys for React Query
 * This helps maintain consistency across the app and makes it easier to invalidate queries
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  // Tickets
  tickets: {
    all: ["tickets"] as const,
    lists: () => [...queryKeys.tickets.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.tickets.lists(), { filters }] as const,
    details: () => [...queryKeys.tickets.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.tickets.details(), id] as const,
    statistics: (type: string) =>
      [...queryKeys.tickets.all, "statistics", type] as const,
  },

  // Outages
  outages: {
    all: ["outages"] as const,
    lists: () => [...queryKeys.outages.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.outages.lists(), { filters }] as const,
    details: () => [...queryKeys.outages.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.outages.details(), id] as const,
  },

  // Refunds
  refunds: {
    all: ["refunds"] as const,
    lists: () => [...queryKeys.refunds.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.refunds.lists(), { filters }] as const,
    details: () => [...queryKeys.refunds.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.refunds.details(), id] as const,
    user: (userId: string | number) =>
      [...queryKeys.refunds.all, "user", userId] as const,
  },

  // Offices
  offices: {
    all: ["offices"] as const,
    lists: () => [...queryKeys.offices.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.offices.lists(), { filters }] as const,
    details: () => [...queryKeys.offices.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.offices.details(), id] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    customerStats: () => [...queryKeys.dashboard.stats(), "customer"] as const,
    technicianStats: () =>
      [...queryKeys.dashboard.stats(), "technician"] as const,
    supervisorStats: () =>
      [...queryKeys.dashboard.stats(), "supervisor"] as const,
    managerStats: () => [...queryKeys.dashboard.stats(), "manager"] as const,
  },

  // Users/Technicians
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
    technicians: () => [...queryKeys.users.all, "technicians"] as const,
  },

  // Tasks
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.tasks.lists(), { filters }] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.tasks.details(), id] as const,
  },

  // Analytics
  analytics: {
    all: ["analytics"] as const,
    overview: () => [...queryKeys.analytics.all, "overview"] as const,
    performance: () => [...queryKeys.analytics.all, "performance"] as const,
    reports: () => [...queryKeys.analytics.all, "reports"] as const,
  },
} as const;
