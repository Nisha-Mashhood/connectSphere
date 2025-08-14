import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import logger from "../core/Utils/Logger";
import { ContactRepository } from "../Modules/Contact/Repositry/ContactRepositry";
import { GroupRepository } from "../Modules/Group/Repositry/GroupRepositry";
import { ChatRepository } from "../Modules/Chat/Repositry/ChatRepositry";
import { UserRepository } from "../Modules/Auth/Repositry/UserRepositry";
import { NotificationService } from "../Modules/Notification/Service/NotificationService";
import { ChatSocketHandler } from "./ChatSocketHandler";
import { CallSocketHandler } from "./CallSocketHandler";
import { GroupCallSocketHandler } from "./GroupCallSocketHandler";
import { NotificationSocketHandler } from "./NotificationSocketHandler";
import { CallData, MarkAsReadData, Message, TypingData } from "./types";

interface GroupCallData {
  groupId: string;
  senderId: string;
  recipientId: string;
  callType: "audio" | "video";
  callId: string;
}

interface GroupOfferData extends GroupCallData {
  offer: RTCSessionDescriptionInit;
}

interface GroupAnswerData extends GroupCallData {
  answer: RTCSessionDescriptionInit;
}

interface GroupIceCandidateData extends GroupCallData {
  candidate: RTCIceCandidateInit;
}

interface JoinGroupCallData {
  groupId: string;
  userId: string;
  callType: "audio" | "video";
  callId: string;
}

export class SocketService {
  private io: Server | null = null;
  public static notificationEmitter: EventEmitter = new EventEmitter();
  private chatHandler: ChatSocketHandler;
  private callHandler: CallSocketHandler;
  private groupCallHandler: GroupCallSocketHandler;
  private notificationHandler: NotificationSocketHandler;

  constructor() {
    const contactRepo = new ContactRepository();
    const groupRepo = new GroupRepository();
    const chatRepo = new ChatRepository();
    const userRepo = new UserRepository();
    const notificationService = new NotificationService();

    this.chatHandler = new ChatSocketHandler(contactRepo, groupRepo, chatRepo, notificationService);
    this.callHandler = new CallSocketHandler(contactRepo, groupRepo, userRepo, notificationService);
    this.groupCallHandler = new GroupCallSocketHandler(groupRepo, userRepo, notificationService);
    this.notificationHandler = new NotificationSocketHandler(notificationService);
  }

  public initialize(io: Server): void {
    this.io = io;
    this.callHandler.setIo(io); 
    this.groupCallHandler.setIo(io); 
    this.notificationHandler.initializeSocket(io);
    logger.info("Socket.IO server initialized");

    SocketService.notificationEmitter.on("notification", (notification) => {
      this.notificationHandler.emitTaskNotification(notification);
    });

    this.io.on("connection", (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    logger.info(`New socket connection: ${socket.id}`);
    const userId = socket.handshake.auth.userId as string;
    socket.data.userId = userId;
    logger.info(
      `New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`
    );

    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}`);

    // Chat-related events
    socket.on("joinChats", (userId: string) =>
      this.chatHandler.handleJoinChats(socket, userId)
    );
    socket.on("joinUserRoom", (userId: string) =>
      this.chatHandler.handleJoinUserRoom(socket, userId)
    );
    socket.on("ensureUserRoom", this.chatHandler.handleEnsureUserRoom.bind(this.chatHandler, socket));
    socket.on("leaveUserRoom", (userId: string) =>
      this.chatHandler.handleLeaveUserRoom(socket, userId)
    );
    socket.on("activeChat", (data: { userId: string; chatKey: string }) =>
      this.chatHandler.handleActiveChat(data)
    );
    socket.on("sendMessage", (message: Message) =>
      this.chatHandler.handleSendMessage(socket, message)
    );
    socket.on("typing", (data: TypingData) =>
      this.chatHandler.handleTyping(socket, data)
    );
    socket.on("stopTyping", (data: TypingData) =>
      this.chatHandler.handleStopTyping(socket, data)
    );
    socket.on("markAsRead", (data: MarkAsReadData) =>
      this.chatHandler.handleMarkAsRead(socket, data)
    );
    socket.on("leaveChat", (userId: string) =>
      this.chatHandler.handleLeaveChat(userId)
    );

    // One-on-one call events
    socket.on("offer", (data: CallData) => this.callHandler.handleOffer(socket, data));
    socket.on("answer", (data: CallData) => this.callHandler.handleAnswer(socket, data));
    socket.on("ice-candidate", (data: CallData) => this.callHandler.handleIceCandidate(socket, data));
    socket.on("callEnded", (data: CallData) => this.callHandler.handleCallEnded(socket, data));

    // Group call events
    socket.on("groupOffer", (data: GroupOfferData) => this.groupCallHandler.handleGroupOffer(socket, data));
    socket.on("groupAnswer", (data: GroupAnswerData) => this.groupCallHandler.handleGroupAnswer(socket, data));
    socket.on("groupIceCandidate", (data: GroupIceCandidateData) =>
      this.groupCallHandler.handleGroupIceCandidate(socket, data)
    );
    socket.on("groupCallEnded", (data: GroupCallData) =>
      this.groupCallHandler.handleGroupCallEnded(socket, data)
    );
    socket.on("joinGroupCall", (data: JoinGroupCallData) =>
      this.groupCallHandler.handleJoinGroupCall(socket, data)
    );

    // Notification events
    socket.on("notification.read", (data: { notificationId: string; userId: string }) =>
      this.notificationHandler.handleNotificationRead(socket, data)
    );

    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  public handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    if (userId) {
      socket.leave(`user_${userId}`);
      logger.info(`User ${userId} left personal room: user_${userId}, socketId=${socket.id}`);
    }
    //check for group rooms
    const rooms = Array.from(socket.rooms).filter((room) => room.startsWith("group_"));
    if(rooms){
      this.groupCallHandler.handleDisconnect(socket);
    }
    logger.info(`User disconnected: socketId=${socket.id}, userId=${userId}`);
  }
}