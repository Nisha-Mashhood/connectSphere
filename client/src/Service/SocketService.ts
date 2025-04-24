import { io, Socket } from "socket.io-client";
import { IChatMessage, Notification } from "../types";

export class SocketService {
  public socket: Socket | null = null;
  private userId: string | null = null;
  private callEndedSent = new Set<string>();

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
      this.socket?.emit("joinUserRoom", userId);
      this.callEndedSent.clear();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.callEndedSent.clear();
    console.log("Socket disconnected");
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  public emitActiveChat(userId: string, chatKey: string) {
    console.log("Sending activeChat event:", { userId, chatKey });
    this.socket?.emit("activeChat", { userId, chatKey });
  }

  public sendMessage(message: IChatMessage & { targetId: string; type: string }) {
    console.log("Sending message:", message);
    this.socket?.emit("sendMessage", message);
  }

  public sendTyping(userId: string, targetId: string, type: string, chatKey: string) {
    console.log("Sending typing event:", { userId, targetId, type, chatKey });
    this.socket?.emit("typing", { userId, targetId, type, chatKey });
  }

  public sendStopTyping(userId: string, targetId: string, type: string, chatKey: string) {
    console.log("Sending stopTyping event:", { userId, targetId, type, chatKey });
    this.socket?.emit("stopTyping", { userId, targetId, type, chatKey });
  }

  public markAsRead(chatKey: string, userId: string, type: string) {
    console.log("Sending markAsRead event:", { chatKey, userId, type });
    this.socket?.emit("markAsRead", { chatKey, userId, type });
  }

  // WebRTC signaling methods
  public sendOffer(targetId: string, type: string, chatKey: string, offer: RTCSessionDescriptionInit, callType: "audio" | "video") {
    if (this.socket && this.userId) {
      console.log(`Sending ${callType} offer to ${targetId} for chatKey: ${chatKey}`);
      this.socket.emit("offer", { userId: this.userId, targetId, type, chatKey, offer, callType });
    } else {
      console.error("Cannot send offer: Socket or userId missing");
    }
  }

  public sendAnswer(targetId: string, type: string, chatKey: string, answer: RTCSessionDescriptionInit, callType: "audio" | "video") {
    if (this.socket && this.userId) {
      console.log(`Sending ${callType} answer to ${targetId} for chatKey: ${chatKey}`);
      this.socket.emit("answer", { userId: this.userId, targetId, type, chatKey, answer, callType });
    } else {
      console.error("Cannot send answer: Socket or userId missing");
    }
  }

  public sendIceCandidate(targetId: string, type: string, chatKey: string, candidate: RTCIceCandidateInit, callType: "audio" | "video") {
    if (this.socket && this.userId) {
      console.log(`Sending ${callType} ICE candidate to ${targetId} for chatKey: ${chatKey}`);
      this.socket.emit("ice-candidate", { userId: this.userId, targetId, type, chatKey, candidate, callType });
    } else {
      console.error("Cannot send ICE candidate: Socket or userId missing");
    }
  }

  public emitCallEnded(targetId: string, type: string, chatKey: string, callType: "audio" | "video") {
    if (this.socket && this.userId) {
      const eventKey = `${chatKey}_${callType}`;
      if (this.callEndedSent.has(eventKey)) {
        console.log(`Skipping duplicate callEnded for ${eventKey}`);
        return;
      }
      this.callEndedSent.add(eventKey);
      console.log(`Sending callEnded to ${targetId} for chatKey: ${chatKey}, callType: ${callType}`);
      this.socket.emit("callEnded", { userId: this.userId, targetId, type, chatKey, callType });
      setTimeout(() => this.callEndedSent.delete(eventKey), 60000); // Clear after 60s
    } else {
      console.error("Cannot send callEnded: Socket or userId missing");
    }
  }

  public onReceiveMessage(callback: (message: IChatMessage) => void) {
    this.socket?.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      callback(message);
    });
  }

  public onMessageSaved(callback: (message: IChatMessage) => void) {
    this.socket?.on("messageSaved", (message) => {
      console.log("Message saved:", message);
      callback(message);
    });
  }

  public onTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("typing", (data) => {
      console.log("Received typing event:", data);
      callback(data);
    });
  }

  public onStopTyping(callback: (data: { userId: string; chatKey: string }) => void) {
    this.socket?.on("stopTyping", (data) => {
      console.log("Received stopTyping event:", data);
      callback(data);
    });
  }

  public onMessagesRead(callback: (data: { chatKey: string; userId: string }) => void) {
    this.socket?.on("messagesRead", (data) => {
      console.log("Received messagesRead event:", data);
      callback(data);
    });
  }

  public onOffer(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; offer: RTCSessionDescriptionInit, callType: "audio" | "video" }) => void) {
    this.socket?.on("offer", (data) => {
      console.log("Received offer:", data);
      callback(data);
    });
  }

  public onAnswer(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; answer: RTCSessionDescriptionInit, callType: "audio" | "video" }) => void) {
    this.socket?.on("answer", (data) => {
      console.log("Received answer:", data);
      callback(data);
    });
  }

  public onIceCandidate(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; candidate: RTCIceCandidateInit, callType: "audio" | "video" }) => void) {
    this.socket?.on("ice-candidate", (data) => {
      console.log("Received ICE candidate:", data);
      callback(data);
    });
  }

  public onCallEnded(callback: (data: { userId: string; targetId: string; type: string; chatKey: string; callType: "audio" | "video" }) => void) {
    this.socket?.on("callEnded", (data) => {
      console.log("Received callEnded:", data);
      callback(data);
    });
  }

  public onNotificationNew(callback: (notification: Notification) => void) {
    this.socket?.on("notification.new", (notification) => {
      console.log("Received notification:", notification);
      callback(notification);
    });
  }

  public onNotificationRead(callback: (data: { notificationId: string }) => void) {
    this.socket?.on("notification.read", (data) => {
      console.log("Received notification.read:", data);
      callback(data);
    });
  }

  public onNotificationUpdated(callback: (notification: Notification) => void) {
    this.socket?.on("notification.updated", (notification) => {
      console.log("Received notification.updated:", notification);
      callback(notification);
    });
  }

  public markNotificationAsRead(notificationId: string, userId: string) {
    console.log("Sending notification.read event:", { notificationId, userId });
    this.socket?.emit("notification.read", { notificationId, userId });
  }
}

export const socketService = new SocketService();