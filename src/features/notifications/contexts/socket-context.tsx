import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/features/auth/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Notification } from "../api/notifications";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  useEffect(() => {
    // Clear notification cache when user changes (different user logs in)
    const currentUserId = user?._id || null;
    if (previousUserId !== null && previousUserId !== currentUserId) {
      // User changed - clear old notifications
      queryClient.removeQueries({ queryKey: queryKeys.notifications.all });
    }
    setPreviousUserId(currentUserId);

    if (!user) {
      // Disconnect socket if user logs out
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      // Clear notification cache when user logs out
      queryClient.removeQueries({ queryKey: queryKeys.notifications.all });
      setPreviousUserId(null);
      return;
    }

    // Get token from cookies (backend uses cookie-based auth)
    // For Socket.IO, we need to pass the token in auth
    // Since we're using cookies, we can get the token from document.cookie
    const getTokenFromCookie = (): string | null => {
      const cookies = document.cookie.split(";");
      const jwtCookie = cookies.find((cookie) => cookie.trim().startsWith("jwt="));
      if (jwtCookie) {
        return jwtCookie.split("=")[1];
      }
      return null;
    };

    const token = getTokenFromCookie();
    if (!token) {
      console.warn("No JWT token found in cookies for Socket.IO connection");
      return;
    }

    const socketInstance = getSocket(token);
    if (!socketInstance) {
      return;
    }

    setSocket(socketInstance);

    // Listen for connection status
    socketInstance.on("connect", () => {
      console.log("Socket.IO connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setIsConnected(false);
    });

    // Listen for notifications
    socketInstance.on("notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      
      // Invalidate notification queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    });

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.off("connect");
        socketInstance.off("disconnect");
        socketInstance.off("notification");
      }
    };
  }, [user, queryClient, previousUserId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

