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

  //listen to the particular event
  onReceiveMessage(callback: (message: IChatMessage) => void) {
    this.socket?.on("receiveMessage", callback);
  }

  onMessageSaved(callback: (message: IChatMessage) => void) {
    this.socket?.on("messageSaved", callback);
  }

  onTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("typing", callback);
  }

  onStopTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("stopTyping", callback);
  }

  onMessagesRead(callback: (data: { chatKey: string; userId: string }) => void) {
    this.socket?.on("messagesRead", callback);
  }

  //emit this particular events
  sendMessage(message: IChatMessage & { targetId: string; type: string }) {
    this.socket?.emit("sendMessage", message);
  }

  sendTyping(userId: string, targetId: string, type: string, chatKey: string) {
    this.socket?.emit("typing", { userId, targetId, type, chatKey });
  }

  sendStopTyping(userId: string, targetId: string, type: string, chatKey: string) {
    this.socket?.emit("stopTyping", { userId, targetId, type, chatKey });
  }

  markAsRead(chatKey: string, userId: string, type: string) {
    this.socket?.emit("markAsRead", { chatKey, userId, type });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();