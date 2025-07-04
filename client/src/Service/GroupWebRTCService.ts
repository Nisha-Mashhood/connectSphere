export class GroupWebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStreams: Map<string, MediaStream> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private iceCandidateCallback: (userId: string, candidate: RTCIceCandidateInit, callType: 'audio' | 'video', callId: string) => void;
  private trackCallback: (userId: string, stream: MediaStream) => void;
  private connectionStateCallback: (userId: string, state: string) => void;

  constructor(
    iceCandidateCallback: (userId: string, candidate: RTCIceCandidateInit, callType: 'audio' | 'video', callId: string) => void,
    trackCallback: (userId: string, stream: MediaStream) => void,
    connectionStateCallback: (userId: string, state: string) => void
  ) {
    this.iceCandidateCallback = iceCandidateCallback;
    this.trackCallback = trackCallback;
    this.connectionStateCallback = connectionStateCallback;
  }

  async initGroupCall(userIds: string[], callType: 'audio' | 'video'): Promise<void> {
    console.log('Initializing group call for users:', userIds);

    const configuration: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    userIds.forEach((userId) => {
      if (!this.peerConnections.has(userId)) {
        const peerConnection = new RTCPeerConnection(configuration);
        console.log(`Creating peer connection for user ${userId}`);

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log(`Generated ICE candidate for user ${userId}:`, event.candidate);
            this.iceCandidateCallback(userId, event.candidate, callType, 'test-call-id');
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          console.log(`ICE connection state for ${userId}: ${peerConnection.iceConnectionState}`);
          console.log(`ICE gathering state for ${userId}: ${peerConnection.iceGatheringState}`);
          console.log(`Signaling state for ${userId}: ${peerConnection.signalingState}`);
          if (peerConnection.iceConnectionState === 'failed') {
            console.warn(`ICE connection failed for ${userId}`);
            peerConnection.restartIce();
          }
          this.connectionStateCallback(userId, peerConnection.iceConnectionState);
        };

        peerConnection.ontrack = (event) => {
          console.log(`Received remote track for ${userId}:`, event.track);
          let stream = this.remoteStreams.get(userId);
          if (!stream) {
            stream = new MediaStream();
            this.remoteStreams.set(userId, stream);
          }
          stream.addTrack(event.track);
          event.track.onmute = () => console.log(`Track for ${userId} muted:`, event.track);
          event.track.onunmute = () => {
            console.log(`Track for ${userId} unmuted:`, event.track);
            this.trackCallback(userId, stream);
          };
          this.trackCallback(userId, stream);
        };

        this.peerConnections.set(userId, peerConnection);
      }
    });
  }

  async addLocalStream(userId: string, stream: MediaStream): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      stream.getTracks().forEach((track) => {
        console.log(`Adding local track for ${userId}:`, track);
        peerConnection.addTrack(track, stream);
      });
      this.localStreams.set(userId, stream);
    } else {
      console.error(`No peer connection for user ${userId}`);
      throw new Error(`No peer connection for user ${userId}`);
    }
  }

  getLocalStream(userId: string): MediaStream | undefined {
    return this.localStreams.get(userId);
  }

  getRemoteStream(userId: string): MediaStream | undefined {
    return this.remoteStreams.get(userId);
  }

  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId);
  }

  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`ICE candidate added successfully for user ${userId}`);
      } catch (error) {
        console.error(`Error adding ICE candidate for user ${userId}:`, error);
        throw error;
      }
    } else {
      console.error(`No peer connection found for user ${userId}`);
      throw new Error(`No peer connection for user ${userId}`);
    }
  }

  stop(): void {
    this.peerConnections.forEach((peerConnection, userId) => {
      console.log(`Closing peer connection for user ${userId}`);
      peerConnection.close();
    });
    this.localStreams.forEach((stream, userId) => {
      stream.getTracks().forEach((track) => track.stop());
      console.log(`Stopped local stream for user ${userId}`);
    });
    this.remoteStreams.forEach((stream, userId) => {
      stream.getTracks().forEach((track) => track.stop());
      console.log(`Stopped remote stream for user ${userId}`);
    });
    this.peerConnections.clear();
    this.localStreams.clear();
    this.remoteStreams.clear();
    console.log('All peer connections and streams closed');
  }
}