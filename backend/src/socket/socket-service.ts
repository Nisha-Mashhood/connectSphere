import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import logger from "../core/Utils/logger";
import { CallData, MarkAsReadData, Message, TypingData } from "../Utils/Types/socket-service-types";
import { inject, injectable } from "inversify";
import { ISocketService } from "../Interfaces/Services/i-socket-service";
import { IChatSocketHandler } from "../Interfaces/Services/i-chat-socket-handler";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { IGroupCallSocketHandler } from "../Interfaces/Services/i-group-call-socket-handler";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";

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

@injectable()
export class SocketService implements ISocketService{
  private _io: Server | null = null;
  public static notificationEmitter: EventEmitter = new EventEmitter();
  private _chatHandler: IChatSocketHandler;
  private _callHandler: ICallSocketHandler;
  private _groupCallHandler: IGroupCallSocketHandler;
  private _notificationHandler: INotificationSocketHandler;

  constructor(
    @inject("IChatSocketHandler") chatHandler: IChatSocketHandler,
    @inject("ICallSocketHandler") callHandler: ICallSocketHandler,
    @inject("IGroupCallSocketHandler") groupCallHandler: IGroupCallSocketHandler,
    @inject("INotificationSocketHandler") notificationHandler: INotificationSocketHandler
  ) {
    this._chatHandler = chatHandler;
    this._callHandler = callHandler;
    this._groupCallHandler = groupCallHandler;
    this._notificationHandler = notificationHandler;
  }

  public initialize(io: Server): void {
    this._io = io;
    this._callHandler.setIo(io); 
    this._groupCallHandler.setIo(io); 
    this._notificationHandler.initializeSocket(io);
    logger.info("Socket.IO server initialized");

    SocketService.notificationEmitter.on("notification", (notification) => {
      this._notificationHandler.emitTaskNotification(notification);
    });

    this._io.on("connection", (socket: Socket) => {
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
      this._chatHandler.handleJoinChats(socket, userId)
    );
    socket.on("joinUserRoom", (userId: string) =>
      this._chatHandler.handleJoinUserRoom(socket, userId)
    );
    socket.on("ensureUserRoom", (data: { userId: string }) =>
    this._chatHandler.handleEnsureUserRoom(socket, data)
    );
    socket.on("leaveUserRoom", (userId: string) =>
      this._chatHandler.handleLeaveUserRoom(socket, userId)
    );
    socket.on("activeChat", (data: { userId: string; chatKey: string }) =>
      this._chatHandler.handleActiveChat(data)
    );
    socket.on("sendMessage", (message: Message) =>
      this._chatHandler.handleSendMessage(socket, message)
    );
    socket.on("typing", (data: TypingData) =>
      this._chatHandler.handleTyping(socket, data)
    );
    socket.on("stopTyping", (data: TypingData) =>
      this._chatHandler.handleStopTyping(socket, data)
    );
    socket.on("markAsRead", (data: MarkAsReadData) =>
      this._chatHandler.handleMarkAsRead(socket, data)
    );
    socket.on("leaveChat", (userId: string) =>
      this._chatHandler.handleLeaveChat(userId)
    );

    // One-on-one call events
    socket.on("offer", (data: CallData) => this._callHandler.handleOffer(socket, data));
    socket.on("answer", (data: CallData) => this._callHandler.handleAnswer(socket, data));
    socket.on("ice-candidate", (data: CallData) => this._callHandler.handleIceCandidate(socket, data));
    socket.on("callEnded", (data: CallData) => this._callHandler.handleCallEnded(socket, data));

    // Group call events
    socket.on("groupOffer", (data: GroupOfferData) => this._groupCallHandler.handleGroupOffer(socket, data));
    socket.on("groupAnswer", (data: GroupAnswerData) => this._groupCallHandler.handleGroupAnswer(socket, data));
    socket.on("groupIceCandidate", (data: GroupIceCandidateData) =>
      this._groupCallHandler.handleGroupIceCandidate(socket, data)
    );
    socket.on("groupCallEnded", (data: GroupCallData) =>
      this._groupCallHandler.handleGroupCallEnded(socket, data)
    );
    socket.on("joinGroupCall", (data: JoinGroupCallData) =>
      this._groupCallHandler.handleJoinGroupCall(socket, data)
    );

    // Notification events
    socket.on("notification.read", (data: { notificationId: string; userId: string }) =>
      this._notificationHandler.handleNotificationRead(socket, data)
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
      this._groupCallHandler.handleDisconnect(socket);
    }
    logger.info(`User disconnected: socketId=${socket.id}, userId=${userId}`);
  }
}