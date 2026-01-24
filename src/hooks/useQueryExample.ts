/**
 * Example hooks demonstrating React Query usage patterns
 * These serve as templates for creating data fetching hooks throughout the app
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

// Example: Fetching data with useQuery
export const useTicketsExample = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters || {}),
    queryFn: async () => {
      // Replace with actual API call
      const response = await fetch("/api/tickets");
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    // Optional: customize behavior
    staleTime: 1000 * 60 * 5, // 5 minutes
    // enabled: !!userId, // conditional fetching
  });
};

// Example: Fetching a single item
export const useTicketDetailExample = (ticketId: string | number) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) throw new Error("Failed to fetch ticket");
      return response.json();
    },
    enabled: !!ticketId, // Only fetch if ticketId exists
  });
};

// Example: Creating/updating data with useMutation
export const useCreateTicketExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: Record<string, unknown>) => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) throw new Error("Failed to create ticket");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch all ticket queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
    onError: (error) => {
      console.error("Error creating ticket:", error);
      // Handle error (e.g., show toast notification)
    },
  });
};

// Example: Update mutation
export const useUpdateTicketExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string | number;
      [key: string]: unknown;
    }) => {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update ticket");
      return response.json();
    },
    onSuccess: (data, variables) => {
      void data;
      // Update the specific ticket in cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.id),
      });
      // Invalidate list to show updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
};

// Example: Delete mutation
export const useDeleteTicketExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string | number) => {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete ticket");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};

// Example: Mutation with optimistic updates
export const useUpdateTicketOptimisticExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string | number;
      [key: string]: unknown;
    }) => {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update ticket");
      return response.json();
    },
    // Optimistic update
    onMutate: async (newTicket) => {
      const ticketKey = queryKeys.tickets.detail(newTicket.id);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ticketKey });

      // Snapshot the previous value
      const previousTicket = queryClient.getQueryData(ticketKey);

      // Optimistically update to the new value
      queryClient.setQueryData(ticketKey, newTicket);

      // Return context with the previous value
      return { previousTicket, ticketKey };
    },
    // If mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTicket, context) => {
      void err;
      void newTicket;
      if (context?.previousTicket) {
        queryClient.setQueryData(context.ticketKey, context.previousTicket);
      }
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      void data;
      void error;
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.id),
      });
    },
  });
};
