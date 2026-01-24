import apiClient from "@/lib/axios";

export interface Notification {
  _id: string;
  userId: string;
  type: "ticket_assigned" | "ticket_resolved" | "ticket_closed" | "ticket_unresolved" | "outage_created" | "outage_resolved";
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: "ticket" | "outage";
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  status: string;
  results: number;
  data: {
    notifications: Notification[];
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    unreadCount: number;
  };
}

export const notificationApi = {
  getMyNotifications: async (params?: { read?: boolean; limit?: number }): Promise<NotificationResponse> => {
    const response = await apiClient.get("/notifications", { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get("/notifications/unread/count");
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ status: string; data: { notification: Notification } }> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ status: string; message: string }> => {
    const response = await apiClient.patch("/notifications/read/all");
    return response.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

