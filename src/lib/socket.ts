import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket | null => {
  if (!token) {
    return null;
  }

  // If socket already exists and is connected, return it
  if (socket && socket.connected) {
    return socket;
  }

  // Create new socket connection
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const socketUrl = apiBaseUrl.replace("/api/v1", "");

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

