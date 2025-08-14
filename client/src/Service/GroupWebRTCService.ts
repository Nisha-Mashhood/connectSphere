// import { GroupCallService } from "../Components/User/Common/Chat/Groups/GroupCallService";

// export class GroupWebRTCService {
//   private peerConnections: Map<string, RTCPeerConnection> = new Map();
//   private localStream: MediaStream | null = null;
//   private remoteStreams: Map<string, MediaStream> = new Map();
//   private iceCandidateCallback: (
//     userId: string,
//     candidate: RTCIceCandidateInit,
//     callType: "audio" | "video",
//     callId: string
//   ) => void;
//   private trackCallback: (userId: string, stream: MediaStream) => void;
//   private connectionStateCallback: (userId: string, state: string) => void;
//   private callId: string;

//   constructor(
//     iceCandidateCallback: (
//       userId: string,
//       candidate: RTCIceCandidateInit,
//       callType: "audio" | "video",
//       callId: string
//     ) => void,
//     trackCallback: (userId: string, stream: MediaStream) => void,
//     connectionStateCallback: (userId: string, state: string) => void,
//     callId: string
//   ) {
//     this.iceCandidateCallback = iceCandidateCallback;
//     this.trackCallback = trackCallback;
//     this.connectionStateCallback = connectionStateCallback;
//     this.callId = callId;
//   }

//   async initGroupCall(
//     userIds: string[],
//     callType: "audio" | "video"
//   ): Promise<void> {
//    console.log("Initializing group call for users:", userIds);

//   const configuration: RTCConfiguration = {
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" },
//       {
//         urls: "turn:openrelay.metered.ca:80",
//         username: "openrelayproject",
//         credential: "openrelayproject",
//       },
//     ],
//   };

//   for (const userId of userIds) {
//     if (!this.peerConnections.has(userId)) {
//       const peerConnection = new RTCPeerConnection(configuration);
//       console.log(`Creating peer connection for user ${userId}`);

//       peerConnection.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log(`Generated ICE candidate for user ${userId}:`, event.candidate);
//           this.iceCandidateCallback(userId, event.candidate, callType, this.callId);
//         }
//       };

//       peerConnection.oniceconnectionstatechange = () => {
//         console.log(`ICE connection state for ${userId}: ${peerConnection.iceConnectionState}`);
//         console.log(`ICE gathering state for ${userId}: ${peerConnection.iceGatheringState}`);
//         console.log(`Signaling state for ${userId}: ${peerConnection.signalingState}`);
//         if (peerConnection.iceConnectionState === "failed") {
//           console.warn(`ICE connection failed for ${userId}`);
//           peerConnection.restartIce();
//         }
//         this.connectionStateCallback(userId, peerConnection.iceConnectionState);
//       };

//       peerConnection.ontrack = (event) => {
//         console.log(`Received remote track for ${userId}:`, event.track);
//         let stream = this.remoteStreams.get(userId);
//         if (!stream) {
//           stream = new MediaStream();
//           this.remoteStreams.set(userId, stream);
//         }
//         stream.addTrack(event.track);
//         event.track.onmute = () => console.log(`Track for ${userId} muted:`, event.track);
//         event.track.onunmute = () => {
//           console.log(`Track for ${userId} unmuted:`, event.track);
//           this.trackCallback(userId, stream);
//         };
//         this.trackCallback(userId, stream);
//       };
//       peerConnection.onsignalingstatechange = () => {
//         console.log(`Signaling state for ${userId}: ${peerConnection.signalingState}`);
//       };

//       this.peerConnections.set(userId, peerConnection);

//       // Add local stream 
//       if (this.localStream) {
//         await this.addLocalStream(userId, this.localStream, this.callId);
//         console.log(`Automatically added existing local stream for user ${userId}`);
//       }
//     } else {
//       console.log(`Peer connection already exists for user ${userId}`);
//       //local stream is added to existing peer connection
//       if (this.localStream) {
//         await this.addLocalStream(userId, this.localStream, this.callId);
//         console.log(`Re-added local stream to existing peer connection for user ${userId}`);
//       }
//     }
//   }
//   }

//   async addLocalStream(
//     userId: string,
//     stream: MediaStream,
//     senderId: string
//   ): Promise<void> {
//     const peerConnection = this.peerConnections.get(userId);
//     if (!peerConnection) {
//       console.error(`No peer connection for user ${userId}`);
//       throw new Error(`No peer connection for user ${userId}`);
//     }

//     try {
//       stream.getTracks().forEach((track) => {
//         const existingSender = peerConnection
//           .getSenders()
//           .find((sender) => sender.track === track);
//         if (existingSender) {
//           console.log(`Track ${track.kind} already added for user ${userId}`);
//           return;
//         }

//         console.log(`Adding local track for ${userId}:`, track);
//         const sender = peerConnection.addTrack(track, stream);

//         if (
//           track.kind === "video" &&
//           peerConnection.signalingState === "stable"
//         ) {
//           try {
//             const parameters = sender.getParameters();
//             if (!parameters.encodings || parameters.encodings.length === 0) {
//               parameters.encodings = [{ maxBitrate: 300000 }];
//             } else {
//               parameters.encodings[0] = {
//                 ...parameters.encodings[0],
//                 maxBitrate: 300000,
//                 scaleResolutionDownBy: 1,
//               };
//             }
//             sender.setParameters(parameters).catch((err) => {
//               console.error(`Failed to set parameters for ${userId}:`, err);
//             });
//           } catch (err) {
//             console.error(
//               `Failed to configure video parameters for ${userId}:`,
//               err
//             );
//           }
//         }
//       });

//       if (!this.localStream) {
//         this.localStream = stream;
//         console.log(`Stored local stream for sender ${senderId}`);
//       }
//     } catch (error) {
//       console.error(`Error adding local stream for ${userId}:`, error);
//       throw error;
//     }
//   }

//   getLocalStream(): MediaStream | null {
//     return this.localStream;
//   }

//   setLocalStream(stream: MediaStream | null): void {
//     this.localStream = stream;
//     console.log(`Set local stream in GroupWebRTCService`);
//   }

//   getRemoteStream(userId: string): MediaStream | undefined {
//     return this.remoteStreams.get(userId);
//   }

//   getPeerConnection(userId: string): RTCPeerConnection | undefined {
//     return this.peerConnections.get(userId);
//   }

//   async addIceCandidate(
//     userId: string,
//     candidate: RTCIceCandidateInit
//   ): Promise<void> {
//     const peerConnection = this.peerConnections.get(userId);
//     if (peerConnection) {
//       try {
//         await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log(`ICE candidate added successfully for user ${userId}`);
//       } catch (error) {
//         console.error(`Error adding ICE candidate for user ${userId}:`, error);
//         throw error;
//       }
//     } else {
//       console.error(`No peer connection found for user ${userId}`);
//       throw new Error(`No peer connection for user ${userId}`);
//     }
//   }

//   // WebRTC offer for a single recipient
//   async createOffer(
//     userId: string,
//     senderId: string,
//     groupCallService?: GroupCallService
//   ): Promise<RTCSessionDescriptionInit> {
//     const peerConnection = this.peerConnections.get(userId);
//   let localStream = this.localStream;

//   if (!peerConnection) {
//     console.error(`No peer connection for user ${userId}`);
//     throw new Error(`No peer connection for user ${userId}`);
//   }

//     if (!localStream && groupCallService) {
//     localStream = groupCallService.getLocalStream();
//     if (localStream) {
//       this.setLocalStream(localStream);
//       await this.addLocalStream(userId, localStream, senderId);
//       console.log(`Restored local stream for sender ${senderId} from GroupCallService`);
//     }
//   }

//   if (!localStream) {
//     console.error(`No local stream for sender ${senderId}`);
//     throw new Error(`No local stream for sender ${senderId}`);
//   }

//   localStream.getTracks().forEach((track) => {
//     const existingSender = peerConnection
//       .getSenders()
//       .find((sender) => sender.track === track);
//     if (!existingSender) {
//       console.log(`Adding track ${track.kind} to peer connection for ${userId}`);
//       const sender = peerConnection.addTrack(track, localStream);
//       if (track.kind === "video") {
//         const parameters = sender.getParameters();
//         if (!parameters.encodings) {
//           parameters.encodings = [{}];
//         }
//         parameters.encodings[0].maxBitrate = 300_000; // 300 kbps
//         sender
//           .setParameters(parameters)
//           .then(() => {
//             console.log(`Set max bitrate for ${userId} video sender`);
//           })
//           .catch((err) => {
//             console.error(`Failed to set parameters for ${userId}:`, err);
//           });
//       }
//     } else {
//       console.log(`Track ${track.kind} already added for ${userId}`);
//     }
//   });

//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   console.log(`Created offer for ${userId}:`, offer);
//   return offer;
//   }

//   // Create a WebRTC answer for a single recipient
//   async createAnswer(userId: string): Promise<RTCSessionDescriptionInit> {
//     const peerConnection = this.peerConnections.get(userId);

//     if (!peerConnection) {
//       console.error(`No peer connection for user ${userId}`);
//       throw new Error(`No peer connection for user ${userId}`);
//     }

//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     console.log(`Created answer for ${userId}:`, answer);
//     return answer;
//   }

//   // Set remote offer on a peer connection
//   async setRemoteOffer(
//     userId: string,
//     offer: RTCSessionDescriptionInit
//   ): Promise<void> {
//     const peerConnection = this.peerConnections.get(userId);

//     if (!peerConnection) {
//       console.error(`No peer connection for user ${userId}`);
//       throw new Error(`No peer connection for user ${userId}`);
//     }

//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//     console.log(`Set remote offer from ${userId}`);
//   }

//   // Set remote answer on a peer connection
//   async setRemoteAnswer(
//     userId: string,
//     answer: RTCSessionDescriptionInit
//   ): Promise<void> {
//     const peerConnection = this.peerConnections.get(userId);

//     if (!peerConnection) {
//       console.error(`No peer connection for user ${userId}`);
//       throw new Error(`No peer connection for user ${userId}`);
//     }

//     await peerConnection.setRemoteDescription(
//       new RTCSessionDescription(answer)
//     );
//     console.log(`Set remote answer from ${userId}`);
//   }

//   // Close peer connection and streams for a specific user
//   async closeConnection(userId: string): Promise<void> {
//     const peerConnection = this.peerConnections.get(userId);
//     if (peerConnection && peerConnection.connectionState !== "closed") {
//       peerConnection.close();
//       this.peerConnections.delete(userId);
//       console.log(`Closed peer connection for user ${userId}`);
//     }
//     const stream = this.remoteStreams.get(userId);
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       this.remoteStreams.delete(userId);
//       console.log(`Stopped remote stream for user ${userId}`);
//     }
//   }

//   // Stop all peer connections and streams
//   stop(): void {
//     // Close all peer connections
//     this.peerConnections.forEach((peerConnection, userId) => {
//       console.log(`Closing peer connection for user ${userId}`);
//       peerConnection.close();
//     });
//     this.peerConnections.clear();

//     // Stop local stream tracks and clear
//     if (this.localStream) {
//       this.localStream.getTracks().forEach((track) => {
//         track.stop();
//         console.log(`Stopped local stream track: ${track.kind}`);
//       });
//       this.localStream = null;
//       console.log("Local stream stopped and cleared");
//     }

//     // Stop remote stream tracks and clear
//     this.remoteStreams.forEach((stream, userId) => {
//       stream.getTracks().forEach((track) => {
//         track.stop();
//         console.log(
//           `Stopped remote stream track for user ${userId}: ${track.kind}`
//         );
//       });
//     });
//     this.remoteStreams.clear();
//     console.log("All peer connections and streams closed");
//   }
// }
