import { io, Socket } from "socket.io-client";
import { IChatMessage } from "../types";

export class SocketService {
  public socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string, token: string) {
    this.userId = userId;
    this.socket = io("http://localhost:3000", {
      auth: { token },
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
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

  disconnect() {
    this.socket?.disconnect();
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  sendMessage(message: IChatMessage & { targetId: string; type: string }) {
    console.log("Sending message:", message);
    this.socket?.emit("sendMessage", message);
  }

  sendTyping(userId: string, targetId: string, type: string, chatKey: string) {
    console.log("Sending typing event:", { userId, targetId, type, chatKey });
    this.socket?.emit("typing", { userId, targetId, type, chatKey });
  }

  sendStopTyping(userId: string, targetId: string, type: string, chatKey: string) {
    console.log("Sending stopTyping event:", { userId, targetId, type, chatKey });
    this.socket?.emit("stopTyping", { userId, targetId, type, chatKey });
  }

  markAsRead(chatKey: string, userId: string, type: string) {
    console.log("Sending markAsRead event:", { chatKey, userId, type });
    this.socket?.emit("markAsRead", { chatKey, userId, type });
  }

  // WebRTC signaling methods
  sendOffer(targetId: string, type: string, chatKey: string, offer: RTCSessionDescriptionInit) {
    if (this.socket && this.userId) {
      console.log("Sending offer:", { userId: this.userId, targetId, type, chatKey, offer });
      this.socket.emit("offer", { userId: this.userId, targetId, type, chatKey, offer });
    } else {
      console.error("Cannot send offer: Socket or userId missing");
    }
  }

  sendAnswer(targetId: string, type: string, chatKey: string, answer: RTCSessionDescriptionInit) {
    if (this.socket && this.userId) {
      console.log("Sending answer:", { userId: this.userId, targetId, type, chatKey, answer });
      this.socket.emit("answer", { userId: this.userId, targetId, type, chatKey, answer });
    } else {
      console.error("Cannot send answer: Socket or userId missing");
    }
  }

  sendIceCandidate(targetId: string, type: string, chatKey: string, candidate: RTCIceCandidateInit) {
    if (this.socket && this.userId) {
      console.log("Sending ICE candidate:", { userId: this.userId, targetId, type, chatKey, candidate });
      this.socket.emit("ice-candidate", { userId: this.userId, targetId, type, chatKey, candidate });
    } else {
      console.error("Cannot send ICE candidate: Socket or userId missing");
    }
  }

  onReceiveMessage(callback: (message: IChatMessage) => void) {
    this.socket?.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      callback(message);
    });
  }

  onMessageSaved(callback: (message: IChatMessage) => void) {
    this.socket?.on("messageSaved", (message) => {
      console.log("Message saved:", message);
      callback(message);
    });
  }

  onTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("typing", (data) => {
      console.log("Received typing event:", data);
      callback(data);
    });
  }

  onStopTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("stopTyping", (data) => {
      console.log("Received stopTyping event:", data);
      callback(data);
    });
  }

  onMessagesRead(callback: (data: { chatKey: string; userId: string }) => void) {
    this.socket?.on("messagesRead", (data) => {
      console.log("Received messagesRead event:", data);
      callback(data);
    });
  }

  onOffer(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on("offer", (data) => {
      console.log("Received offer:", data);
      callback(data);
    });
  }

  onAnswer(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; answer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on("answer", (data) => {
      console.log("Received answer:", data);
      callback(data);
    });
  }

  onIceCandidate(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; candidate: RTCIceCandidateInit }) => void) {
    this.socket?.on("ice-candidate", (data) => {
      console.log("Received ICE candidate:", data);
      callback(data);
    });
  }
}

export const socketService = new SocketService();