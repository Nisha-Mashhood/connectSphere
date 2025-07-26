import { io, Socket } from "socket.io-client";
import { GroupIceCandidateData, IChatMessage, Notification } from "../types";

export class SocketService {
  public socket: Socket | null = null;
  private userId: string | null = null;
  private callEndedSent = new Set<string>();
  private sentGroupOffers = new Set<string>();
  private sentGroupAnswers = new Set<string>();

  connect(userId: string, token: string) {
    this.userId = userId;
    this.socket = io("http://localhost:3000", {
      auth: { token, userId },
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log(
        `[SocketService] Connected to Socket.IO server: socketId=${this.socket?.id}, userId=${userId}`
      );
      console.log(
        `[SocketService] Emitting joinChats and joinUserRoom for user: ${userId}`
      );
      this.socket?.emit("joinChats", userId);
      this.socket?.emit("joinUserRoom", userId);
      this.callEndedSent.clear();
      this.sentGroupOffers.clear();
      this.sentGroupAnswers.clear();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    return this.socket;
  }

  public leaveChat(userId: string) {
    console.log("Sending leaveChat event:", userId);
    this.socket?.emit("leaveChat", userId);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.callEndedSent.clear();
    this.sentGroupOffers.clear();
    this.sentGroupAnswers.clear();
    console.log("Socket disconnected");
  }

  isConnected() {
    const connected = this.socket?.connected || false;
    console.log(
      `[SocketService] Connection status for user ${this.userId}: ${connected}`
    );
    return this.socket?.connected || false;
  }

  public emitActiveChat(userId: string, chatKey: string) {
    console.log("Sending activeChat event:", { userId, chatKey });
    this.socket?.emit("activeChat", { userId, chatKey });
  }

  public sendMessage(
    message: IChatMessage & { targetId: string; type: string }
  ) {
    console.log("Sending message:", message);
    this.socket?.emit("sendMessage", message);
  }

  public sendTyping(
    userId: string,
    targetId: string,
    type: string,
    chatKey: string
  ) {
    console.log("Sending typing event:", { userId, targetId, type, chatKey });
    this.socket?.emit("typing", { userId, targetId, type, chatKey });
  }

  public sendStopTyping(
    userId: string,
    targetId: string,
    type: string,
    chatKey: string
  ) {
    console.log("Sending stopTyping event:", {
      userId,
      targetId,
      type,
      chatKey,
    });
    this.socket?.emit("stopTyping", { userId, targetId, type, chatKey });
  }

  public markAsRead(chatKey: string, userId: string, type: string) {
    console.log("Sending markAsRead event:", { chatKey, userId, type });
    this.socket?.emit("markAsRead", { chatKey, userId, type });
  }

  // WebRTC signaling methods
  public sendOffer(
    targetId: string,
    type: string,
    chatKey: string,
    offer: RTCSessionDescriptionInit,
    callType: "audio" | "video"
  ) {
    if (this.socket && this.userId) {
      console.log(
        `Sending ${callType} offer to ${targetId} for chatKey: ${chatKey}`
      );
      this.socket.emit("offer", {
        userId: this.userId,
        targetId,
        type,
        chatKey,
        offer,
        callType,
      });
    } else {
      console.error("Cannot send offer: Socket or userId missing");
    }
  }

  public sendAnswer(
    targetId: string,
    type: string,
    chatKey: string,
    answer: RTCSessionDescriptionInit,
    callType: "audio" | "video"
  ) {
    if (this.socket && this.userId) {
      console.log(
        `Sending ${callType} answer to ${targetId} for chatKey: ${chatKey}`
      );
      this.socket.emit("answer", {
        userId: this.userId,
        targetId,
        type,
        chatKey,
        answer,
        callType,
      });
    } else {
      console.error("Cannot send answer: Socket or userId missing");
    }
  }

  public sendIceCandidate(
    targetId: string,
    type: string,
    chatKey: string,
    candidate: RTCIceCandidateInit,
    callType: "audio" | "video"
  ) {
    if (this.socket && this.userId) {
      console.log(
        `Sending ${callType} ICE candidate to ${targetId} for chatKey: ${chatKey}`
      );
      this.socket.emit("ice-candidate", {
        userId: this.userId,
        targetId,
        type,
        chatKey,
        candidate,
        callType,
      });
    } else {
      console.error("Cannot send ICE candidate: Socket or userId missing");
    }
  }

  public emitCallEnded(
    targetId: string,
    type: string,
    chatKey: string,
    callType: "audio" | "video"
  ) {
    if (this.socket && this.userId) {
      const eventKey = `${chatKey}_${callType}`;
      if (this.callEndedSent.has(eventKey)) {
        console.log(`Skipping duplicate callEnded for ${eventKey}`);
        return;
      }
      this.callEndedSent.add(eventKey);
      console.log(
        `Sending callEnded to ${targetId} for chatKey: ${chatKey}, callType: ${callType}`
      );
      this.socket.emit("callEnded", {
        userId: this.userId,
        targetId,
        type,
        chatKey,
        callType,
      });
      setTimeout(() => this.callEndedSent.delete(eventKey), 60000); // Clear after 60s
    } else {
      console.error("Cannot send callEnded: Socket or userId missing");
    }
  }

  //Group call
  public sendGroupIceCandidate(
    groupId: string,
    senderId: string,
    recipientId: string,
    candidate: RTCIceCandidateInit,
    callType: "audio" | "video",
    callId: string
  ) {
    if (this.socket && this.userId) {
      console.log(
        `Sending group ${callType} ICE candidate to ${recipientId} for group ${groupId}, callId: ${callId}`
      );
      this.socket.emit("groupIceCandidate", {
        groupId,
        senderId,
        recipientId,
        candidate,
        callType,
        callId,
      });
    } else {
      console.error(
        "Cannot send group ICE candidate: Socket or userId missing"
      );
    }
  }

  public sendGroupOffer(
    groupId: string,
    senderId: string,
    recipientId: string,
    offer: RTCSessionDescriptionInit,
    callType: "audio" | "video",
    callId: string
  ) {
    if (this.socket && this.userId) {
      // Deduplicate group offers to prevent redundant signaling
      const offerKey = `${callId}:${senderId}:${recipientId}`;
      if (this.sentGroupOffers.has(offerKey)) {
        console.log(`Skipping duplicate group offer: ${offerKey}`);
        return;
      }
      this.sentGroupOffers.add(offerKey);
      console.log(
        `Sending group ${callType} offer to ${recipientId} for group ${groupId}, callId: ${callId}`
      );
      this.socket.emit("groupOffer", {
        groupId,
        senderId,
        recipientId,
        offer,
        callType,
        callId,
      });
      // Clean up deduplication entry after 30 seconds to match backend timeout
      setTimeout(() => this.sentGroupOffers.delete(offerKey), 30000);
    } else {
      console.error("Cannot send group offer: Socket or userId missing");
    }
  }

  public sendGroupAnswer(
    groupId: string,
    senderId: string,
    recipientId: string,
    answer: RTCSessionDescriptionInit,
    callType: "audio" | "video",
    callId: string
  ) {
    if (this.socket && this.userId) {
      // Deduplicate group answers to prevent redundant signaling
      const answerKey = `${callId}:${senderId}:${recipientId}`;
      if (this.sentGroupAnswers.has(answerKey)) {
        console.log(`Skipping duplicate group answer: ${answerKey}`);
        return;
      }
      this.sentGroupAnswers.add(answerKey);
      console.log(
        `Sending group ${callType} answer to ${recipientId} for group ${groupId}, callId: ${callId}`
      );
      this.socket.emit("groupAnswer", {
        groupId,
        senderId,
        recipientId,
        answer,
        callType,
        callId,
      });
      // Clean up deduplication entry after 30 seconds to match backend timeout
      setTimeout(() => this.sentGroupAnswers.delete(answerKey), 30000);
    } else {
      console.error("Cannot send group answer: Socket or userId missing");
    }
  }

  // Add listener for sendGroupOffersAndAnswers
  public onSendGroupOffersAndAnswers(
    callback: (data: {
      groupId: string;
      callId: string;
      callType: "audio" | "video";
      offerRecipients: string[];
      answerRecipients: string[];
    }) => void
  ) {
    this.socket?.on("sendGroupOffersAndAnswers", (data) => {
      console.log("Received sendGroupOffersAndAnswers:", data);
      callback(data);
    });
  }

  // Add cleanup for sendGroupOffersAndAnswers listener
  public offSendGroupOffersAndAnswers(
    callback: (data: {
      groupId: string;
      callId: string;
      callType: "audio" | "video";
      offerRecipients: string[];
      answerRecipients: string[];
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("sendGroupOffersAndAnswers", callback);
      console.log("Unregistered sendGroupOffersAndAnswers listener");
    }
  }

  public onGroupIceCandidate(callback: (data: GroupIceCandidateData) => void) {
    this.socket?.on("groupIceCandidate", (data) => {
      console.log("Received group ICE candidate:", data);
      callback(data);
    });
  }

  public onGroupOffer(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ) {
    this.socket?.on("groupOffer", (data) => {
      console.log("Received group offer:", data);
      callback(data);
    });
  }

  public onGroupAnswer(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      answer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ) {
    this.socket?.on("groupAnswer", (data) => {
      console.log("Received group answer:", data);
      callback(data);
    });
  }

  offGroupIceCandidate(callback: (data: GroupIceCandidateData) => void): void {
    if (this.socket) {
      this.socket.off("groupIceCandidate", callback);
      console.log("Unregistered groupIceCandidate listener");
    }
  }

  public offGroupOffer(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("groupOffer", callback);
      console.log("Unregistered groupOffer listener");
    }
  }

  public offGroupAnswer(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      answer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("groupAnswer", callback);
      console.log("Unregistered groupAnswer listener");
    }
  }

  public emitGroupCallEnded(
    groupId: string,
    senderId: string,
    recipientId: string,
    callType: "audio" | "video",
    callId: string
  ): void {
    if (this.socket && this.userId) {
      const eventKey = `${groupId}_${callId}_${callType}`;
      if (this.callEndedSent.has(eventKey)) {
        console.log(`Skipping duplicate groupCallEnded for ${eventKey}`);
        return;
      }
      this.callEndedSent.add(eventKey);
      console.log(
        `Emitting groupCallEnded to ${recipientId} for group ${groupId}, callId: ${callId}`
      );
      this.socket.emit("groupCallEnded", {
        groupId,
        senderId,
        recipientId,
        callType,
        callId,
      });
      setTimeout(() => this.callEndedSent.delete(eventKey), 60000); // Clear after 60s
    } else {
      console.error("Cannot send groupCallEnded: Socket or userId missing");
    }
  }

  public onGroupCallEnded(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    this.socket?.on("groupCallEnded", (data) => {
      console.log("Received group call ended:", data);
      callback(data);
    });
  }

  public offGroupCallEnded(
    callback: (data: {
      groupId: string;
      senderId: string;
      recipientId: string;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("groupCallEnded", callback);
      console.log("Unregistered groupCallEnded listener");
    }
  }

  public emitJoinGroupCall(
    groupId: string,
    userId: string,
    callType: "audio" | "video",
    callId: string
  ): void {
    if (this.socket && this.userId) {
      console.log(
        `Emitting joinGroupCall for user ${userId} in group ${groupId}, callId: ${callId}, callType: ${callType}`
      );
      this.socket.emit("joinGroupCall", { groupId, userId, callType, callId });
    } else {
      console.error("Cannot emit joinGroupCall: Socket or userId missing");
    }
  }

  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit("joinUserRoom", userId);
      console.log(`Emitted joinUserRoom for user_${userId}`);
    }
  }

  leaveUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit("leaveUserRoom", userId);
      console.log(`Emitted leaveUserRoom for user_${userId}`);
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

  public onTyping(
    callback: (data: { userId: string; chatKey: string }) => void
  ) {
    this.socket?.on("typing", (data) => {
      console.log("Received typing event:", data);
      callback(data);
    });
  }

  public onStopTyping(
    callback: (data: { userId: string; chatKey: string }) => void
  ) {
    this.socket?.on("stopTyping", (data) => {
      console.log("Received stopTyping event:", data);
      callback(data);
    });
  }

  public onMessagesRead(
    callback: (data: { chatKey: string; userId: string }) => void
  ) {
    this.socket?.on("messagesRead", (data) => {
      console.log("Received messagesRead event:", data);
      callback(data);
    });
  }

  public onOffer(
    callback: (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      offer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    }) => void
  ) {
    this.socket?.on("offer", (data) => {
      console.log("Received offer:", data);
      callback(data);
    });
  }

  public onAnswer(
    callback: (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      answer: RTCSessionDescriptionInit;
      callType: "audio" | "video";
    }) => void
  ) {
    this.socket?.on("answer", (data) => {
      console.log("Received answer:", data);
      callback(data);
    });
  }

  public onIceCandidate(
    callback: (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      candidate: RTCIceCandidateInit;
      callType: "audio" | "video";
    }) => void
  ) {
    this.socket?.on("ice-candidate", (data) => {
      console.log("Received ICE candidate:", data);
      callback(data);
    });
  }

  public onCallEnded(
    callback: (data: {
      userId: string;
      targetId: string;
      type: string;
      chatKey: string;
      callType: "audio" | "video";
    }) => void
  ) {
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

  public onNotificationRead(
    callback: (data: { notificationId: string, userId?: string,
    type?: string }) => void
  ) {
    this.socket?.on("notification.read", (data) => {
      console.log("Received notification.read:", data);
      callback(data);
    });
  }

  public offNotificationNew(callback: (notification: Notification) => void) {
    this.socket?.off("notification.new", callback);
    console.log("[SocketService] Unregistered notification.new listener");
  }

  public offNotificationRead(
    callback: (data: {
      notificationId?: string;
      userId: string;
      type?: string;
    }) => void
  ) {
    this.socket?.off("notification.read", callback);
    console.log("[SocketService] Unregistered notification.read listener");
  }

  public onNotificationUpdated(callback: (notification: Notification) => void) {
    this.socket?.on("notification.updated", (notification) => {
      console.log("Received notification.updated:", notification);
      callback(notification);
    });
  }

  public markNotificationAsRead(
    notificationId: string,
    userId: string,
    type?: string
  ) {
    console.log("Sending notification.read event:", {
      notificationId,
      userId,
      type,
    });
    this.socket?.emit("notification.read", { notificationId, userId, type });
  }
}

export const socketService = new SocketService();
