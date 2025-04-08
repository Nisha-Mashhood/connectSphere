// src/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { IChatMessage } from "../types";

export class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string, token: string) {
    this.userId = userId;
    this.socket = io("http://localhost:3000", {
      auth: { token },
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5, // Limit to 5 reconnection attempts
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", this.socket?.id);
      this.socket?.emit("joinChats", userId);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    return this.socket;
  }

  onReceiveMessage(callback: (message: IChatMessage) => void) {
    this.socket?.on("receiveMessage", callback);
  }

  onMessageSaved(callback: (message: IChatMessage) => void) {
    this.socket?.on("messageSaved", callback);
  }

  sendMessage(message: IChatMessage & { targetId: string; type: string }) {
    this.socket?.emit("sendMessage", message);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();