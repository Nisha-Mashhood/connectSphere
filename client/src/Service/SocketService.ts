import { io, Socket } from "socket.io-client";
import { debounce } from "lodash";
import {
  GroupAnswerData,
  GroupCallData,
  GroupIceCandidateData,
  GroupOfferData,
  ICallLog,
} from "../types";
import { IChatMessage } from "../Interface/User/IchatMessage";
import { Notification } from "../Interface/User/Inotification";

interface CallData {
  userId: string;
  targetId: string;
  type: "user-user" | "user-mentor" | "group";
  chatKey: string;
  callType: "audio" | "video";
}

// One-on-One call
interface OfferData extends CallData {
  offer: RTCSessionDescriptionInit;
  senderName?: string;
}

interface AnswerData extends CallData {
  answer: RTCSessionDescriptionInit;
}

interface IceCandidateData extends CallData {
  candidate: RTCIceCandidateInit;
}

interface CallCreatedEvent {
  callId: string;
  chatKey: string;
  callType: "audio" | "video";
  type: "group" | "user-mentor" | "user-user";
  senderId: string;
  recipientIds: string[];
  groupId?: string;
  callerName?: string;
  createdAt: string;
}

export class SocketService {
  public socket: Socket | null = null;
  private userId: string | null = null;

  // Deduplication sets for WebRTC events
  private callEndedSent = new Set<string>();
  private sentOffers = new Set<string>();
  private sentAnswers = new Set<string>();

  // Deduplication for chat messages (messageSaved)
  private processedMessages: Set<string> = new Set();

  // Deduplication for notifications (notification.new)
  private processedNotifications: Set<string> = new Set();

  private callIdByChatKey: Map<string, string> = new Map();

  constructor() {
    // Debounced handler to avoid processing the same messageSaved event repeatedly
    this.handleMessageSaved = debounce(
      this.handleMessageSaved.bind(this),
      200,
      {
        leading: true,
        trailing: false,
      }
    );
  }

  // CORE CONNECTION
  //Initialize connection to Socket.IO server for the given user.

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
      console.log( `[SocketService] Connected to Socket.IO server: socketId=${this.socket?.id}, userId=${userId}` );

      // Join base rooms
      this.socket?.emit("joinChats", userId);
      this.socket?.emit("joinUserRoom", userId);

      // Reset WebRTC dedupe tracking
      this.callEndedSent.clear();
      this.sentOffers.clear();
      this.sentAnswers.clear();
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });
    return this.socket;
  }

   //Cleanly disconnect from the Socket.IO server and reset state
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;

    // Reset dedupe sets
    this.callEndedSent.clear();
    this.sentOffers.clear();
    this.sentAnswers.clear();

    console.log("Socket disconnected");
  }

   //Returns whether the socket is currently connected.
  isConnected() {
    const connected = this.socket?.connected || false;
    console.log(
      `[SocketService] Connection status for user ${this.userId}: ${connected}`
    );
    return connected;
  }

  // USER PRESENCE

   //Explicitly join the user-specific room 
  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit("joinUserRoom", userId);
      console.log(`Emitted joinUserRoom for user_${userId}`);
    }
  }


   //Leave the user-specific room (user_<userId>).
  leaveUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit("leaveUserRoom", userId);
      console.log(`Emitted leaveUserRoom for user_${userId}`);
    }
  }

   //Listen for when a user joins their user room.
  public onUserRoomJoined(callback: (data: { userId: string }) => void): void {
    this.socket?.on("userRoomJoined", (data) => {
      console.log(`Received userRoomJoined for user ${data.userId}`);
      callback(data);
    });
  }

   //Stop listening for userRoomJoined events.
  public offUserRoomJoined(callback: (data: { userId: string }) => void): void {
    if (this.socket) {
      this.socket.off("userRoomJoined", callback);
      console.log("Unregistered userRoomJoined listener");
    }
  }

   //Listen for when a user leaves their user room.
  public onUserRoomLeft(callback: (data: { userId: string }) => void): void {
    this.socket?.on("userRoomLeft", (data) => {
      console.log(`Received userRoomLeft for user ${data.userId}`);
      callback(data);
    });
  }

   //Stop listening for userRoomLeft events.
  public offUserRoomLeft(callback: (data: { userId: string }) => void): void {
    if (this.socket) {
      this.socket.off("userRoomLeft", callback);
      console.log("Unregistered userRoomLeft listener");
    }
  }

  //Online and offline listners
  public emitChatOnline(userId: string): void {
    console.log("Emitting chat:online", userId);
    this.socket?.emit("chat:online", { userId });
  }

  public emitChatOffline(userId: string): void {
    console.log("Emitting chat:offline", userId);
    this.socket?.emit("chat:offline", { userId });
  }

  public onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on("userOnline", (data) => {
      console.log("Received userOnline:", data.userId);
      callback(data);
    });
  }

  public offUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.off("userOnline", callback);
  }

  public onUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.on("userOffline", (data) => {
      console.log("Received userOffline:", data.userId);
      callback(data);
    });
  }

  public offUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.off("userOffline", callback);
  }


  // EMITTERS
  //  - Chat
  //  - Notification

  // CHAT EMITTERS

   //Notify server that this user has left a chat context.
  public leaveChat(userId: string): void {
    console.log("Sending leaveChat event:", userId);
    this.socket?.emit("leaveChat", userId);
  }

  //Mark a chat as the currently active chat for the user.
  public emitActiveChat(userId: string, chatKey: string) {
    console.log("Sending activeChat event:", { userId, chatKey });
    this.socket?.emit("activeChat", { userId, chatKey });
  }

  //Send a chat message.
  public sendMessage(
    message: IChatMessage & { targetId: string; type: string }
  ) {
    console.log("Sending message:", message);
    this.socket?.emit("sendMessage", { ...message });
  }

  //Emit typing event for current user in a given chat.
  public sendTyping(
    userId: string,
    targetId: string,
    type: string,
    chatKey: string
  ) {
    console.log("Sending typing event:", { userId, targetId, type, chatKey });
    this.socket?.emit("typing", { userId, targetId, type, chatKey });
  }

  //Emit stopTyping event when user stops typing in a given chat.
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

  //Mark messages in a chat as read by a given user.
  public markAsRead(chatKey: string, userId: string, type: string) {
    console.log("Sending markAsRead event:", { chatKey, userId, type });
    this.socket?.emit("markAsRead", { chatKey, userId, type });
  }

  // NOTIFICATION EMITTERS

   //Mark a notification as read for a given user.
  public markNotificationAsRead( notificationId: string, userId: string, type?: string ) {
    console.log("Sending notification.read event:", {
      notificationId,
      userId,
      type,
    });
    this.socket?.emit("notification.read", { notificationId, userId, type });
  }

  // LISTENERS
  //  - Chat
  //  - Notifications
  //  - Call Logs

  // CHAT LISTENERS

   //Listen for new incoming chat messages.
  public onReceiveMessage(callback: (message: IChatMessage) => void) {
    this.socket?.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      callback(message);
    });
  }


   //Listen for messageSaved event from backend.
  public onMessageSaved(callback: (message: IChatMessage) => void) {
    this.socket?.on("messageSaved", (message) => {
      console.log("Message saved:", message);
      this.handleMessageSaved(message, callback);
    });
  }

   //Internal helper to de-duplicate messageSaved events based on message._id.
  private handleMessageSaved(
    message: IChatMessage,
    callback: (message: IChatMessage) => void
  ) {
    if (this.processedMessages.has(message._id)) {
      console.log("Skipping duplicate messageSaved:", message._id);
      return;
    }
    this.processedMessages.add(message._id);
    console.log("Message saved:", message);
    callback(message);
  }

   //Listen for typing events in any chat.
  public onTyping(
    callback: (data: { userId: string; chatKey: string }) => void
  ) {
    this.socket?.on("typing", (data) => {
      console.log("Received typing event:", data);
      callback(data);
    });
  }

  //Listen for stopTyping events in any chat.
  public onStopTyping(
    callback: (data: { userId: string; chatKey: string }) => void
  ) {
    this.socket?.on("stopTyping", (data) => {
      console.log("Received stopTyping event:", data);
      callback(data);
    });
  }

   //Listen for messagesRead events (read receipts).
  public onMessagesRead(
    callback: (data: { chatKey: string; userId: string }) => void
  ) {
    this.socket?.on("messagesRead", (data) => {
      console.log("Received messagesRead event:", data);
      callback(data);
    });
  }

   //Listen for contactsUpdated events, e.g. when chat contact list should refresh.
  public onContactsUpdated(callback: () => void) {
    this.socket?.on("contactsUpdated", () => {
      console.log("Received contactsUpdated event");
      callback();
    });
  }

   //Stop listening for contactsUpdated events.
  public offContactsUpdated(callback: () => void) {
    if (this.socket) {
      this.socket.off("contactsUpdated", callback);
      console.log("Unregistered contactsUpdated listener");
    }
  }

  // NOTIFICATION LISTENERS

    //Listen for new notifications pushed from backend.
  public onNotificationNew(callback: (notification: Notification) => void) {
    this.socket?.on("notification.new", (notification: Notification) => {
      console.log("Incoming Notification From Backend:", notification);

      if (this.processedNotifications.has(notification.id)) {
        console.log(`Skipping duplicate notification: ${notification.id}`);
        return;
      }

      this.processedNotifications.add(notification.id);
      console.log("Received notification:", notification);
      callback(notification);

      setTimeout(
        () => this.processedNotifications.delete(notification.id),
        60000
      );
    });
  }

  //Stop listening for new notifications.
  public offNotificationNew(callback: (notification: Notification) => void) {
    this.socket?.off("notification.new", callback);
    console.log("[SocketService] Unregistered notification.new listener");
  }

  //Listen for notification.read events coming from server.
  public onNotificationRead(
    callback: (data: {
      notificationId: string;
      userId?: string;
      type?: string;
    }) => void
  ) {
    this.socket?.on("notification.read", (data) => {
      console.log("Received notification.read:", data);
      callback(data);
    });
  }

   //Stop listening for notification.read events.
  public offNotificationRead(
    callback: (data: {
      notificationId?: string;
      userId: string;
      type?: string;
    }) => void
  ) {
    this.socket?.off("notification.read", callback);
    console.log("Unregistered notification.read listener");
  }

    //Listen for notification.updated events
  public onNotificationUpdated(callback: (notification: Notification) => void) {
    this.socket?.on("notification.updated", (notification) => {
      console.log("Received notification.updated:", notification);
      callback(notification);
    });
  }

   //Stop listening for notification.updated events.
  public offNotificationUpdated(
    callback: (notification: Notification) => void
  ): void {
    this.socket?.off("notification.updated", callback);
    console.log("Unregistered notification.updated listener");
  }

  // CALL LOG LISTENERS
   //Listen for new call logs being created (for both one-to-one and group calls).
  public onCallLogCreated(callback: (callLog: ICallLog) => void) {
    this.socket?.on("callLog.created", (callLog: ICallLog) => {
      console.log("Received callLog.created:", callLog);
      callback(callLog);
    });
  }

  //Stop listening for callLog.created events.
  public offCallLogCreated(callback: (callLog: ICallLog) => void) {
    if (this.socket) {
      this.socket.off("callLog.created", callback);
      console.log("[SocketService] Unregistered callLog.created listener");
    }
  }

   //Listen for updates to existing call logs.
  public onCallLogUpdated(callback: (callLog: ICallLog) => void) {
    this.socket?.on("callLog.updated", (callLog: ICallLog) => {
      console.log("Received callLog.updated:", callLog);
      callback(callLog);
    });
  }


   //Stop listening for callLog.updated events.
  public offCallLogUpdated(callback: (callLog: ICallLog) => void) {
    if (this.socket) {
      this.socket.off("callLog.updated", callback);
      console.log("[SocketService] Unregistered callLog.updated listener");
    }
  }

  //One-One webRTC Events

  public getCallIdForChatKey(chatKey: string): string | undefined {
  return this.callIdByChatKey.get(chatKey);
}


public onCallCreated(callback: (data: CallCreatedEvent) => void): void {
  this.socket?.on("call.created", (data: CallCreatedEvent) => {
    console.log("Received call.created from server:", data);
    // store mapping for later use
    if (data && data.callId && data.chatKey) {
      this.callIdByChatKey.set(data.chatKey, data.callId);
    }
    callback(data);
  });
}

public offCallCreated(callback: (data: CallCreatedEvent) => void): void {
  if (this.socket) {
    this.socket.off("call.created", callback);
    console.log("Unregistered call.created listener");
  }
}

  sendOffer(data: OfferData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot send offer: Missing socket or userId");
      return;
    }
    const offerKey = `${data.chatKey}:${data.userId}:${data.targetId}:${data.callType}`;
    if (this.sentOffers.has(offerKey)) {
      console.log(`Skipping duplicate offer: ${offerKey}`);
      return;
    }
    this.sentOffers.add(offerKey);
    console.log(`Sending offer to ${data.targetId}:`, data.offer);
    this.socket.emit("offer", data);
    setTimeout(() => this.sentOffers.delete(offerKey), 30000);
  }

  public onCallEnded(callback: (data: CallData) => void) {
    this.socket?.on("callEnded", (data) => {
      console.log("Received callEnded:", data);
      callback(data);
    });
  }

  public offCallEnded(callback: (data: CallData) => void) {
    if (this.socket) {
      this.socket.off("callEnded", callback);
      console.log("Unregistered callEnded listener");
    }
  }

  emitCallEnded(data: CallData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot emit call ended: Missing socket or userId");
      return;
    }
    const eventKey = `${data.chatKey}:${data.userId}:${data.targetId}:${data.callType}`;
    if (this.callEndedSent.has(eventKey)) {
      console.log(`Skipping duplicate callEnded for ${eventKey}`);
      return;
    }
    this.callEndedSent.add(eventKey);
    console.log(`Emitting call ended to ${data.targetId}`);
    this.socket.emit("callEnded", data);
    setTimeout(() => this.callEndedSent.delete(eventKey), 60000);
  }






  // One-on-One WebRTC signaling methods
  

  sendAnswer(data: AnswerData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot send answer: Missing socket or userId");
      return;
    }
    const answerKey = `${data.chatKey}:${data.userId}:${data.targetId}:${data.callType}`;
    if (this.sentAnswers.has(answerKey)) {
      console.log(`Skipping duplicate answer: ${answerKey}`);
      return;
    }
    this.sentAnswers.add(answerKey);
    console.log(`Sending answer to ${data.targetId}:`, data.answer);
    this.socket.emit("answer", data);
    setTimeout(() => this.sentAnswers.delete(answerKey), 30000);
  }

  sendIceCandidate(data: IceCandidateData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot send ICE candidate: Missing socket or userId");
      return;
    }
    console.log(`Sending ICE candidate to ${data.targetId}:`, data.candidate);
    this.socket.emit("ice-candidate", data);
  }

  

  // Group WebRTC signaling methods
  sendGroupOffer(data: GroupOfferData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot send group offer: Missing socket or userId");
      return;
    }
    console.log(`Group Offer Data :`, data);
    const offerKey = `${data.callId}:${data.senderId}:${data.recipientId}:${data.callType}`;
    if (this.sentOffers.has(offerKey)) {
      console.log(`Skipping duplicate group offer: ${offerKey}`);
      return;
    }
    this.sentOffers.add(offerKey);
    console.log(`Sending group offer to ${data.recipientId}:`, data.offer);
    this.socket.emit("groupOffer", {
      groupId: data.groupId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      offer: data.offer,
      callType: data.callType,
      callId: data.callId,
    });
    setTimeout(() => this.sentOffers.delete(offerKey), 30000);
  }

  sendGroupAnswer(data: GroupAnswerData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot send group answer: Missing socket or userId");
      return;
    }
    const answerKey = `${data.callId}:${data.senderId}:${data.recipientId}:${data.callType}`;
    if (this.sentAnswers.has(answerKey)) {
      console.log(`Skipping duplicate group answer: ${answerKey}`);
      return;
    }
    this.sentAnswers.add(answerKey);
    console.log(`Sending group answer to ${data.recipientId}:`, data.answer);
    this.socket.emit("groupAnswer", {
      groupId: data.groupId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      answer: data.answer,
      callType: data.callType,
      callId: data.callId,
    });
    setTimeout(() => this.sentAnswers.delete(answerKey), 30000);
  }

  sendGroupIceCandidate(data: GroupIceCandidateData): void {
    if (!this.socket || !this.userId) {
      console.error(
        "Cannot send group ICE candidate: Missing socket or userId"
      );
      return;
    }
    console.log(
      `Sending group ICE candidate to ${data.recipientId}:`,
      data.candidate
    );
    this.socket.emit("groupIceCandidate", {
      groupId: data.groupId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      candidate: data.candidate,
      callType: data.callType,
      callId: data.callId,
    });
  }

  emitGroupCallEnded(data: GroupCallData): void {
    if (!this.socket || !this.userId) {
      console.error("Cannot emit group call ended: Missing socket or userId");
      return;
    }
    const eventKey = `${data.callId}:${data.groupId}:${data.callType}`;
    if (this.callEndedSent.has(eventKey)) {
      console.log(`Skipping duplicate group callEnded for ${eventKey}`);
      return;
    }
    this.callEndedSent.add(eventKey);
    console.log(
      `Emitting group call ended for group ${data.groupId}, callId: ${data.callId}`
    );
    this.socket.emit("groupCallEnded", {
      groupId: data.groupId,
      callType: data.callType,
      callId: data.callId,
    });
    setTimeout(() => this.callEndedSent.delete(eventKey), 60000);
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

 

  public onJoinGroupCall(
    callback: (data: {
      groupId: string;
      userId: string;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    this.socket?.on("joinGroupCall", (data) => {
      console.log(
        `Received joinGroupCall for user ${data.userId}, call ${data.callId}`
      );
      callback(data);
    });
  }

  public offJoinGroupCall(
    callback: (data: {
      groupId: string;
      userId: string;
      callType: "audio" | "video";
      callId: string;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("joinGroupCall", callback);
      console.log("Unregistered joinGroupCall listener");
    }
  }


  // One-on-One WebRTC listeners
  public onOffer(callback: (data: OfferData) => void) {
    this.socket?.on("offer", (data: OfferData) => {
      console.log("Received offer:", data);
      callback(data);
    });
  }

  public offOffer(callback: (data: OfferData) => void) {
    if (this.socket) {
      this.socket.off("offer", callback);
      console.log("Unregistered offer listener");
    }
  }

  public onAnswer(callback: (data: AnswerData) => void) {
    this.socket?.on("answer", (data) => {
      console.log("Received answer:", data);
      callback(data);
    });
  }

  public offAnswer(callback: (data: AnswerData) => void) {
    if (this.socket) {
      this.socket.off("answer", callback);
      console.log("Unregistered answer listener");
    }
  }

  public onIceCandidate(callback: (data: IceCandidateData) => void) {
    this.socket?.on("ice-candidate", (data) => {
      console.log("Received ICE candidate:", data);
      callback(data);
    });
  }

  public offIceCandidate(callback: (data: IceCandidateData) => void) {
    if (this.socket) {
      this.socket.off("ice-candidate", callback);
      console.log("Unregistered ice-candidate listener");
    }
  }

  

  // Group WebRTC listeners
  public onGroupOffer(callback: (data: GroupOfferData) => void) {
    this.socket?.on(
      "groupOffer",
      (data: {
        groupId: string;
        senderId: string;
        recipientId: string;
        offer: RTCSessionDescriptionInit;
        callType: "audio" | "video";
        callId: string;
        senderName?: string;
      }) => {
        console.log(`Received group offer from ${data.senderId}`);
        callback({
          groupId: data.groupId,
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: "group",
          callId: data.callId,
          offer: data.offer,
          callType: data.callType,
          senderName: data.senderName,
        });
      }
    );
  }

  public offGroupOffer(callback: (data: GroupOfferData) => void) {
    if (this.socket) {
      this.socket.off("groupOffer", callback);
      console.log("Unregistered group offer listener");
    }
  }

  public onGroupAnswer(callback: (data: GroupAnswerData) => void) {
    this.socket?.on(
      "groupAnswer",
      (data: {
        groupId: string;
        senderId: string;
        recipientId: string;
        answer: RTCSessionDescriptionInit;
        callType: "audio" | "video";
        callId: string;
      }) => {
        console.log(`Received group answer from ${data.senderId}`);
        callback({
          groupId: data.groupId,
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: "group",
          callId: data.callId,
          answer: data.answer,
          callType: data.callType,
        });
      }
    );
  }

  public offGroupAnswer(callback: (data: GroupAnswerData) => void) {
    if (this.socket) {
      this.socket.off("groupAnswer", callback);
      console.log("Unregistered group answer listener");
    }
  }

  public onGroupIceCandidate(callback: (data: GroupIceCandidateData) => void) {
    this.socket?.on(
      "groupIceCandidate",
      (data: {
        groupId: string;
        senderId: string;
        recipientId: string;
        candidate: RTCIceCandidateInit;
        callType: "audio" | "video";
        callId: string;
      }) => {
        console.log(`Received group ICE candidate from ${data.senderId}`);
        callback({
          groupId: data.groupId,
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: "group",
          callId: data.callId,
          candidate: data.candidate,
          callType: data.callType,
        });
      }
    );
  }

  public offGroupIceCandidate(callback: (data: GroupIceCandidateData) => void) {
    if (this.socket) {
      this.socket.off("groupIceCandidate", callback);
      console.log("Unregistered group ice-candidate listener");
    }
  }

  public onGroupCallEnded(callback: (data: GroupCallData) => void) {
    this.socket?.on(
      "groupCallEnded",
      (data: {
        groupId: string;
        callType: "audio" | "video";
        callId: string;
      }) => {
        console.log(
          `Received group callEnded for group ${data.groupId}, callId: ${data.callId}`
        );
        callback({
          groupId: data.groupId,
          type: "group",
          callId: data.callId,
          callType: data.callType,
        });
      }
    );
  }

  public offGroupCallEnded(callback: (data: GroupCallData) => void) {
    if (this.socket) {
      this.socket.off("groupCallEnded", callback);
      console.log("Unregistered group callEnded listener");
    }
  }

  public onJoinedGroupCall(
    callback: (data: {
      groupId: string;
      callId: string;
      callType: "audio" | "video";
      participants: string[];
    }) => void
  ): void {
    this.socket?.on("joinedGroupCall", (data) => {
      console.log(
        `Received joinedGroupCall for call ${data.callId}, participants: ${data.participants}`
      );
      callback(data);
    });
  }

  public offJoinedGroupCall(
    callback: (data: {
      groupId: string;
      callId: string;
      callType: "audio" | "video";
      participants: string[];
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("joinedGroupCall", callback);
      console.log("Unregistered joinedGroupCall listener");
    }
  }

  public emitLeaveGroupCall(data: { groupId: string; userId: string; callId: string }): void {
  if (this.socket) {
    this.socket.emit("leaveGroupCall", data);
    console.log(`Emitted leaveGroupCall for user ${data.userId}, groupId: ${data.groupId}, callId: ${data.callId}`);
  }
}

}

export const socketService = new SocketService();
