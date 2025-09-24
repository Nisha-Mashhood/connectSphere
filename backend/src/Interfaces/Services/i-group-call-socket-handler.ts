import { Server, Socket } from "socket.io";

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

interface GroupJoinCallData {
  groupId: string;
  userId: string;
  callType: "audio" | "video";
  callId: string;
}

export interface IGroupCallSocketHandler {
  setIo(io: Server): void;
  getCallIdForGroup(groupId: string): string | undefined;
  handleGroupOffer(socket: Socket, data: GroupOfferData): Promise<void>;
  handleGroupAnswer(socket: Socket, data: GroupAnswerData): Promise<void>;
  handleGroupIceCandidate(socket: Socket, data: GroupIceCandidateData): Promise<void>;
  handleGroupCallEnded(socket: Socket, data: GroupCallData): Promise<void>;
  handleJoinGroupCall(socket: Socket, data: GroupJoinCallData): Promise<void>;
  handleDisconnect(socket: Socket): Promise<void>;
}