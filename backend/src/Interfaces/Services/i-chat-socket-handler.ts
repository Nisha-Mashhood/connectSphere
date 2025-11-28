import { Server, Socket } from "socket.io";
import { MarkAsReadData, Message, TypingData } from "../../Utils/types/socket-service-types";

export interface IChatSocketHandler {
  setIo(io: Server): void;
  handleJoinChats(socket: Socket, userId: string): Promise<void>;
  handleJoinUserRoom(socket: Socket, userId: string): void;
  handleEnsureUserRoom(socket: Socket, data: { userId: string }): void;
  handleLeaveUserRoom(socket: Socket, userId: string): void;
  handleActiveChat(data: { userId: string; chatKey: string }): void;
  handleSendMessage(socket: Socket, message: Message): Promise<void>;
  handleTyping(socket: Socket, data: TypingData): void;
  handleStopTyping(socket: Socket, data: TypingData): void;
  handleMarkAsRead(socket: Socket, data: MarkAsReadData): Promise<void>;
  handleLeaveChat(userId: string): void;
}