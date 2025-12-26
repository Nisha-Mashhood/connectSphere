import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import logger from "../core/utils/logger";
import { CallData, MarkAsReadData, Message, TypingData } from "../Utils/types/socket-service-types";
import { inject, injectable } from "inversify";
import { ISocketService } from "../Interfaces/Services/i-socket-service";
import { IChatSocketHandler } from "../Interfaces/Services/i-chat-socket-handler";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";



@injectable()
export class SocketService implements ISocketService{
  private _io: Server | null = null;
  public static notificationEmitter: EventEmitter = new EventEmitter();
  private _chatHandler: IChatSocketHandler;
  private _callHandler: ICallSocketHandler;
  // private _groupCallHandler: IGroupCallSocketHandler;
  private _notificationHandler: INotificationSocketHandler;

  constructor(
    @inject("IChatSocketHandler") chatHandler: IChatSocketHandler,
    @inject("ICallSocketHandler") callHandler: ICallSocketHandler,
    // @inject("IGroupCallSocketHandler") groupCallHandler: IGroupCallSocketHandler,
    @inject("INotificationSocketHandler") notificationHandler: INotificationSocketHandler
  ) {
    this._chatHandler = chatHandler;
    this._callHandler = callHandler;
    // this._groupCallHandler = groupCallHandler;
    this._notificationHandler = notificationHandler;
  }

  public initialize(io: Server): void {
    this._io = io;
    this._callHandler.setIo(io); 
    // this._groupCallHandler.setIo(io); 
    this._notificationHandler.initializeSocket(io);
    this._chatHandler.setIo(io);
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

      socket.on("chat:online", ({ userId }) => {
      socket.data.inChat = true;
      logger.info(`[PRESENCE] User ${userId} entered chat`);
      const rooms = Array.from(socket.rooms).filter(
        (r) => r.startsWith("chat_") || r.startsWith("group_")
      );
      rooms.forEach((room) => {
        socket.to(room).emit("userOnline", { userId });
      });
    });

    socket.on("chat:offline", ({ userId }) => {
      socket.data.inChat = false;
      logger.info(`[PRESENCE] User ${userId} left chat`);
      const rooms = Array.from(socket.rooms).filter(
        (r) => r.startsWith("chat_") || r.startsWith("group_")
      );
      rooms.forEach((room) => {
        socket.to(room).emit("userOffline", { userId });
      });
    });

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
    

    // Notification events
    socket.on("notification.read", (data: { notificationId: string; userId: string }) =>
      this._notificationHandler.handleNotificationRead(socket, data)
    );

    socket.on("disconnect", () => this.handleDisconnect(socket));

    socket.on("groupCallStarted", (data: { groupId: string; starterId: string; callType: string; roomName: string; starterName: string }) => {
      logger.info(`Group call started by ${data.starterId} in group ${data.groupId}`);
      const room = `group_${data.groupId}`;
      socket.to(room).emit("groupCallStarted", {
      ...data,
      starterName: data.starterName || "Someone"
  });
      // socket.emit("groupCallStarted", data);
    });

    socket.on("groupCallJoined", (data: { groupId: string; userId: string }) => {
      const room = `group_${data.groupId}`;
      socket.join(room);
      socket.to(room).emit("groupUserJoin", {
        userId: data.userId,
        groupId: data.groupId,
      });
      logger.info(`User ${data.userId} joined group call ${data.groupId}`);
    });

    socket.on("groupCallEnded", (data: { groupId: string; callType: string }) => {
      logger.info(`Group call ended in group ${data.groupId}`);
      const room = `group_${data.groupId}`;
      this._io?.to(room).emit("groupCallEnded", data);
    });
  }

  public handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    if (socket.data.inChat) {
      const rooms = Array.from(socket.rooms).filter(
        (r) => r.startsWith("chat_") || r.startsWith("group_")
      );
      rooms.forEach((room) => {
        socket.to(room).emit("userOffline", { userId });
      });
      logger.info(`[PRESENCE] User ${userId} went OFFLINE due to disconnect`);
    }
    logger.info(`User disconnected: socketId=${socket.id}, userId=${userId}`);
  }

  }