import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notifications";
import { queryKeys } from "@/lib/query-keys";

export const useNotifications = (params?: { read?: boolean; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getMyNotifications(params),
    select: (data) => data.data.notifications,
    retry: 2,
    staleTime: 0, // Always consider data stale, fetch fresh data
    gcTime: 0, // Don't cache, always fetch fresh
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    select: (data) => data.data.unreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    staleTime: 0, // Always consider data stale, fetch fresh data
    gcTime: 0, // Don't cache, always fetch fresh
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

