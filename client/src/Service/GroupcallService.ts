import { SocketService } from "./SocketService";
import { GroupWebRTCService } from "./GroupWebRTCService";
import { GroupIceCandidateData } from "../types";

export class GroupCallService {
  private socketService: SocketService;
  private webRTCService: GroupWebRTCService;
  private currentUserId: string;
  private localStream: MediaStream | null = null;
  private queuedIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private processedEvents: Set<string> = new Set();
  private queuedAnswers: Map<string, RTCSessionDescriptionInit[]> = new Map();
  private queuedOffers: Map<string, RTCSessionDescriptionInit[]> = new Map();

  constructor(
    currentUserId: string,
    socketService: SocketService,
    webRTCService: GroupWebRTCService
  ) {
    this.currentUserId = currentUserId;
    this.socketService = socketService;
    this.webRTCService = webRTCService;

    // Register signaling listeners
    this.socketService.onSendGroupOffersAndAnswers(
      this.handleSendGroupOffersAndAnswers.bind(this)
    );
    this.socketService.onGroupIceCandidate(
      this.handleGroupIceCandidate.bind(this)
    );
    this.socketService.onGroupAnswer(this.handleGroupAnswer.bind(this));
    this.socketService.onGroupCallEnded(this.handleGroupCallEnded.bind(this));
    this.socketService.onGroupOffer(this.handleGroupOffer.bind(this));
  }

  async startGroupCall(
    groupId: string,
    memberIds: string[],
    callType: "audio" | "video",
    callId: string
  ): Promise<MediaStream | null> {
    console.log(
    `Starting group ${callType} call for group ${groupId}, callId: ${callId}`
  );

  try {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });
    console.log(`Local stream acquired for ${this.currentUserId}`);
   this.webRTCService.setLocalStream(this.localStream);
  } catch (error) {
    console.error(
      `Failed to get local stream for ${this.currentUserId}:`,
      error
    );
    throw error;
  }

  const filteredMemberIds = memberIds.filter((id) => id !== this.currentUserId);
  await this.webRTCService.initGroupCall(filteredMemberIds, callType);

  try {
    for (const memberId of filteredMemberIds) {
      const peerConnection = this.webRTCService.getPeerConnection(memberId);
      if (peerConnection && peerConnection.signalingState !== "closed") {
        await this.webRTCService.addLocalStream(
          memberId,
          this.localStream,
          this.currentUserId
        );
        console.log(`Added local stream for member ${memberId}`);
      } else {
        console.error(`No peer connection found for member ${memberId}`);
      }
    }
  } catch (error) {
    console.error(
      `Failed to add local stream for ${this.currentUserId}:`,
      error
    );
    throw error;
    }


    // Emit joinGroupCall
    this.socketService.emitJoinGroupCall(
      groupId,
      this.currentUserId,
      callType,
      callId
    );
    return this.localStream;
  }

  async endGroupCall(
    groupId: string,
    callType: "audio" | "video",
    callId: string,
    recipientIds: string[]
  ): Promise<void> {
    console.log(`Ending group call for group ${groupId}, callId: ${callId}`);
    for (const recipientId of recipientIds) {
      this.socketService.emitGroupCallEnded(
        groupId,
        this.currentUserId,
        recipientId,
        callType,
        callId
      );
    }
    this.webRTCService.stop();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.queuedIceCandidates.clear();
    this.processedEvents.clear();
  }

  private async handleGroupOffer(data: {
    groupId: string;
    senderId: string;
    recipientId: string;
    offer: RTCSessionDescriptionInit;
    callType: "audio" | "video";
    callId: string;
  }): Promise<void> {
   if (data.recipientId !== this.currentUserId) {
    console.log(`Ignoring group offer for ${data.recipientId}`);
    return;
  }

  const { groupId, senderId, offer, callType, callId } = data;
  let peerConnection = this.webRTCService.getPeerConnection(senderId);

  if (!peerConnection) {
    console.log(`Creating peer connection for sender ${senderId}`);
    await this.webRTCService.initGroupCall([senderId], callType);
    peerConnection = this.webRTCService.getPeerConnection(senderId);
    if (this.localStream) {
      await this.webRTCService.addLocalStream(senderId, this.localStream, this.currentUserId);
      console.log(`Added local stream for ${senderId}`);
    }
  }

  if (peerConnection.signalingState !== "stable") {
    console.warn(`Signaling state for ${senderId} is ${peerConnection.signalingState}, queuing offer`);
    // Queue offer 
    if (!this.queuedOffers) this.queuedOffers = new Map();
    if (!this.queuedOffers.has(senderId)) this.queuedOffers.set(senderId, []);
    this.queuedOffers.get(senderId)!.push(offer);
    return;
  }

  try {
    await this.webRTCService.setRemoteOffer(senderId, offer);
    const answer = await this.webRTCService.createAnswer(senderId);
    this.socketService.sendGroupAnswer(groupId, this.currentUserId, senderId, answer, callType, callId);
    console.log(`Sent answer to ${senderId} for callId: ${callId}`);

    // Process queued ICE candidates
    if (this.queuedIceCandidates.has(senderId)) {
      const candidates = this.queuedIceCandidates.get(senderId) || [];
      for (const candidate of candidates) {
        await this.webRTCService.addIceCandidate(senderId, candidate);
        console.log(`Processed queued ICE candidate for ${senderId}`);
      }
      this.queuedIceCandidates.delete(senderId);
    }
  } catch (error) {
    console.error(`Failed to handle offer from ${senderId}:`, error);
  }
  }

  private async handleSendGroupOffersAndAnswers(data: {
    groupId: string;
    callId: string;
    callType: "audio" | "video";
    offerRecipients: string[];
    answerRecipients: string[];
  }): Promise<void> {
  console.log("Handling sendGroupOffersAndAnswers:", JSON.stringify(data, null, 2));
  const { groupId, callId, callType, offerRecipients, answerRecipients } = data;

  // Normalize recipient arrays for consistent event key
  const eventKey = `${groupId}:${callId}:${offerRecipients.sort().join(",")}:${answerRecipients.sort().join(",")}`;
  if (this.processedEvents.has(eventKey)) {
    console.log(`Skipping duplicate sendGroupOffersAndAnswers event: ${eventKey}`);
    return;
  }
  this.processedEvents.add(eventKey);
  setTimeout(() => this.processedEvents.delete(eventKey), 30000); // Clear after 30 seconds

  const allMembers = [...new Set([...offerRecipients, ...answerRecipients])].filter((id) => id !== this.currentUserId);
  for (const memberId of allMembers) {
    if (!this.webRTCService.getPeerConnection(memberId)) {
      console.log(`Initializing peer connection for ${memberId}`);
      await this.webRTCService.initGroupCall([memberId], callType);
      if (this.localStream) {
        await this.webRTCService.addLocalStream(memberId, this.localStream, this.currentUserId);
        console.log(`Added local stream for ${memberId}`);
      }
    }
  }

  // Process offer recipients
  for (const recipientId of offerRecipients.filter((id) => id !== this.currentUserId)) {
    const peerConnection = this.webRTCService.getPeerConnection(recipientId);
    if (!peerConnection) {
      console.error(`No peer connection found for recipient: ${recipientId}`);
      continue;
    }
    if (peerConnection.signalingState !== "stable") {
      console.warn(`Skipping offer creation for ${recipientId}: signaling state is ${peerConnection.signalingState}`);
      continue;
    }
    try {
      const offer = await this.webRTCService.createOffer(recipientId, this.currentUserId, this); // Pass this
      this.socketService.sendGroupOffer(groupId, this.currentUserId, recipientId, offer, callType, callId);
      console.log(`Sent group offer to ${recipientId} for callId: ${callId}`);
    } catch (error) {
      console.error(`Failed to create offer for ${recipientId}:`, error);
    }
  }

  // Process answer recipients
  for (const recipientId of answerRecipients.filter((id) => id !== this.currentUserId)) {
    const peerConnection = this.webRTCService.getPeerConnection(recipientId);
    if (!peerConnection) {
      console.error(`No peer connection found for answer recipient: ${recipientId}`);
      continue;
    }
    if (peerConnection.signalingState !== "have-remote-offer") {
      console.warn(`Cannot create answer for ${recipientId}: signaling state is ${peerConnection.signalingState}`);
      continue;
    }
    try {
      const answer = await this.webRTCService.createAnswer(recipientId);
      this.socketService.sendGroupAnswer(groupId, this.currentUserId, recipientId, answer, callType, callId);
      console.log(`Sent group answer to ${recipientId} for callId: ${callId}`);
    } catch (error) {
      console.error(`Failed to create answer for ${recipientId}:`, error);
    }
  }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  private async handleGroupIceCandidate(
    data: GroupIceCandidateData
  ): Promise<void> {
    if (data.recipientId !== this.currentUserId) {
      console.log(`Ignoring ICE candidate for ${data.recipientId}`);
      return;
    }

    const peerConnection = this.webRTCService.getPeerConnection(data.senderId);
    if (!peerConnection) {
      console.error(`No peer connection found for sender: ${data.senderId}`);
      // Queue the ICE candidate
      if (!this.queuedIceCandidates.has(data.senderId)) {
        this.queuedIceCandidates.set(data.senderId, []);
      }
      this.queuedIceCandidates.get(data.senderId)!.push(data.candidate);
      console.log(`Queued ICE candidate from ${data.senderId}`);
      return;
    }

    if (peerConnection.remoteDescription) {
      try {
        await this.webRTCService.addIceCandidate(data.senderId, data.candidate);
        console.log(`Added ICE candidate from ${data.senderId}`);
      } catch (error) {
        console.error(
          `Error adding ICE candidate from ${data.senderId}:`,
          error
        );
      }
    } else {
      // Queue the ICE candidate if remote description is not set
      if (!this.queuedIceCandidates.has(data.senderId)) {
        this.queuedIceCandidates.set(data.senderId, []);
      }
      this.queuedIceCandidates.get(data.senderId)!.push(data.candidate);
      console.log(
        `Queued ICE candidate from ${data.senderId} (no remote description yet)`
      );
    }
  }

  private async handleGroupAnswer(data: {
    groupId: string;
    senderId: string;
    recipientId: string;
    answer: RTCSessionDescriptionInit;
    callType: "audio" | "video";
    callId: string;
  }): Promise<void> {
    if (data.recipientId !== this.currentUserId) {
    console.log(`Ignoring group answer for ${data.recipientId}`);
    return;
  }

  const peerConnection = this.webRTCService.getPeerConnection(data.senderId);
  if (!peerConnection) {
    console.error(`No peer connection found for sender: ${data.senderId}`);
    return;
  }

  if (peerConnection.signalingState !== "have-local-offer") {
    console.warn(
      `Queuing answer for ${data.senderId}: signaling state is ${peerConnection.signalingState}`
    );
    // Queue the answer for later processing
    if (!this.queuedAnswers) {
      this.queuedAnswers = new Map<string, RTCSessionDescriptionInit[]>();
    }
    if (!this.queuedAnswers.has(data.senderId)) {
      this.queuedAnswers.set(data.senderId, []);
    }
    this.queuedAnswers.get(data.senderId)!.push(data.answer);
    return;
  }

  try {
    await this.webRTCService.setRemoteAnswer(data.senderId, data.answer);
    console.log(`Set remote answer from ${data.senderId}`);

    // Process queued ICE candidates
    if (this.queuedIceCandidates.has(data.senderId)) {
      const candidates = this.queuedIceCandidates.get(data.senderId) || [];
      for (const candidate of candidates) {
        try {
          await this.webRTCService.addIceCandidate(data.senderId, candidate);
          console.log(`Processed queued ICE candidate for ${data.senderId}`);
        } catch (error) {
          console.error(
            `Error processing queued ICE candidate for ${data.senderId}:`,
            error
          );
        }
      }
      this.queuedIceCandidates.delete(data.senderId);
    }

    // Process queued answers
    if (this.queuedAnswers?.has(data.senderId)) {
      const answers = this.queuedAnswers.get(data.senderId) || [];
      for (const answer of answers) {
        if (peerConnection.signalingState === "have-local-offer") {
          try {
            await this.webRTCService.setRemoteAnswer(data.senderId, answer);
            console.log(`Processed queued answer for ${data.senderId}`);
          } catch (error) {
            console.error(
              `Failed to process queued answer for ${data.senderId}:`,
              error
            );
          }
        }
      }
      this.queuedAnswers.delete(data.senderId);
    }
  } catch (error) {
    console.error(`Failed to set remote answer from ${data.senderId}:`, error);
  }
  }

  private async handleGroupCallEnded(data: {
    groupId: string;
    senderId: string;
    recipientId: string;
    callType: "audio" | "video";
    callId: string;
  }): Promise<void> {
    if (data.recipientId === this.currentUserId) {
      await this.webRTCService.closeConnection(data.senderId);
      console.log(`Closed connection for ${data.senderId}`);
    }
  }

  dispose(): void {
    this.socketService.offSendGroupOffersAndAnswers(
      this.handleSendGroupOffersAndAnswers.bind(this)
    );
    this.socketService.offGroupIceCandidate(
      this.handleGroupIceCandidate.bind(this)
    );
    this.socketService.offGroupAnswer(this.handleGroupAnswer.bind(this));
    this.socketService.offGroupCallEnded(this.handleGroupCallEnded.bind(this));
    this.webRTCService.stop();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
    this.queuedIceCandidates.clear();
    this.processedEvents.clear();
    console.log("GroupCallService disposed");
  }
}
