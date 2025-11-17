import { Server, Socket } from "socket.io";
import { CallData } from "../../Utils/types/socket-service-types";

export interface ICallSocketHandler {
  setIo(io: Server): void;
  handleOffer(socket: Socket, data: CallData): Promise<void>;
  handleAnswer(socket: Socket, data: CallData): Promise<void>;
  handleIceCandidate(socket: Socket, data: CallData): Promise<void>;
  handleCallEnded(socket: Socket, data: CallData): Promise<void>;
}