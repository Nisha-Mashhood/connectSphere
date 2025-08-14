export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private singlePeerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private addedTrackIds: Set<string> = new Set();
  private onTrackCallbacks: Map<string, (event: RTCTrackEvent, targetId: string) => void> = new Map();
  private onIceCandidateCallbacks: Map<string, (candidate: RTCIceCandidateInit) => void> = new Map();
  private isOffererMap: Map<string, boolean> = new Map();
  public onNegotiationNeeded: ((targetId: string, offer: RTCSessionDescriptionInit) => void) | undefined;
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();

  constructor() {
    console.log("WebRTCService initialized");
  }

  async initPeerConnection(targetId?: string, isOfferer: boolean = false): Promise<RTCPeerConnection> {
    if (!targetId) {
      if (this.singlePeerConnection && this.singlePeerConnection.connectionState !== "closed") {
        console.log("Single peer connection already initialized, returning existing");
        return this.singlePeerConnection;
      }
      const config: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      };
      console.log("Initializing single peer connection with config:", config);
      try {
        this.singlePeerConnection = new RTCPeerConnection(config);
        this.isOffererMap.set("single", isOfferer);
        this.setupPeerConnectionEvents(this.singlePeerConnection, "single");
        console.log("Single peer connection initialized successfully");
        return this.singlePeerConnection;
      } catch (error) {
        console.error("Error initializing single peer connection:", error);
        throw error;
      }
    } else {
      if (this.peerConnections.has(targetId) && this.peerConnections.get(targetId)!.connectionState !== "closed") {
        console.log(`Peer connection for ${targetId} already initialized, returning existing`);
        return this.peerConnections.get(targetId)!;
      }
      const config: RTCConfiguration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      };
      console.log(`Initializing peer connection for ${targetId} with config:`, config);
      try {
        const peerConnection = new RTCPeerConnection(config);
        this.peerConnections.set(targetId, peerConnection);
        this.isOffererMap.set(targetId, isOfferer);
        this.setupPeerConnectionEvents(peerConnection, targetId);
        console.log(`Peer connection initialized for ${targetId}`);
        return peerConnection;
      } catch (error) {
        console.error(`Error initializing peer connection for ${targetId}:`, error);
        throw error;
      }
    }
  }


  private setupPeerConnectionEvents(peerConnection: RTCPeerConnection, targetId: string) {
  peerConnection.oniceconnectionstatechange = () => {
    console.log(`ICE connection state for ${targetId}: ${peerConnection.iceConnectionState}`);
    if (peerConnection.iceConnectionState === "failed") {
      console.error(`ICE connection failed for ${targetId}, restarting ICE`);
      try {
        peerConnection.restartIce();
      } catch (error) {
        console.error(`Error restarting ICE for ${targetId}:`, error);
      }
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log(`Connection state for ${targetId}: ${peerConnection.connectionState}`);
    if (peerConnection.connectionState === "connected") {
      console.log(`Peer connection established for ${targetId}`);
    } else if (peerConnection.connectionState === "failed") {
      console.error(`Connection failed for ${targetId}, attempting to restart ICE`);
      try {
        peerConnection.restartIce();
      } catch (error) {
        console.error(`Error restarting ICE for ${targetId}:`, error);
      }
    }
  };

  peerConnection.onsignalingstatechange = () => {
    console.log(`Signaling state for ${targetId}: ${peerConnection.signalingState}`);
  };

  peerConnection.ontrack = (event) => {
    console.log(`Received remote track from ${targetId}, streams:`, event.streams);
    if (event.streams[0]) {
      const tracks = event.streams[0].getTracks();
      console.log(`Remote stream tracks for ${targetId}:`, tracks.map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })));
      const callback = this.onTrackCallbacks.get(targetId);
      if (callback) {
        callback(event, targetId);
      } else {
        console.warn(`No onTrack callback registered for ${targetId}`);
      }
    } else {
      console.warn(`No stream received in ontrack for ${targetId}`);
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`Generated ICE candidate for ${targetId}:`, event.candidate.toJSON());
      const callback = this.onIceCandidateCallbacks.get(targetId);
      if (callback) {
        callback(event.candidate.toJSON());
      }
    }
  };

  peerConnection.onnegotiationneeded = async () => {
    if (!this.isOffererMap.get(targetId)) {
      console.log(`Negotiation needed for ${targetId}, but not an offerer, skipping`);
      return;
    }
    console.log(`Negotiation needed for ${targetId}, creating offer`);
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log(`Offer created and local description set for ${targetId}:`, offer);
      if (this.onNegotiationNeeded) {
        this.onNegotiationNeeded(targetId, offer);
        console.log(`Called onNegotiationNeeded for ${targetId}`);
      } else {
        console.warn(`No onNegotiationNeeded callback set for ${targetId}`);
      }
    } catch (error) {
      console.error(`Error handling negotiation for ${targetId}:`, error);
    }
  };
}


  // Check remote description
  hasRemoteDescription(targetId?: string): boolean {
    if (!targetId) {
      if (!this.singlePeerConnection) {
        console.log("No single peer connection exists");
        return false;
      }
      const hasRemoteDesc = !!this.singlePeerConnection.remoteDescription;
      console.log(`Remote description for single: ${hasRemoteDesc}, signalingState: ${this.singlePeerConnection.signalingState}`);
      return hasRemoteDesc;
    }
    const peerConnection = this.peerConnections.get(targetId);
    if (!peerConnection) {
      console.log(`No peer connection exists for ${targetId}`);
      return false;
    }
    const hasRemoteDesc = !!peerConnection.remoteDescription;
    console.log(`Remote description for ${targetId}: ${hasRemoteDesc}, signalingState: ${peerConnection.signalingState}`);
    return hasRemoteDesc;
  }

async getLocalStream(): Promise<MediaStream> {
  console.log("Requesting user media (video and audio)");
  try {
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: true,
      });
    }
    const tracks = this.localStream.getTracks();
    console.log("Local stream acquired, track details:");
    tracks.forEach((track, index) => {
      console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
    });
    if (tracks.length === 0) {
      console.error("No tracks found in local stream");
      throw new Error("No tracks found in local stream");
    }

    // Add tracks
    if (this.singlePeerConnection) {
      tracks.forEach((track) => {
        if (!this.addedTrackIds.has(`single:${track.id}`)) {
          console.log(`Adding local track to single peer connection:`, track);
          this.singlePeerConnection.addTrack(track, this.localStream!);
          this.addedTrackIds.add(`single:${track.id}`);
        } else {
          console.log(`Skipping already added track for single:`, track.id);
        }
      });
    }

    return this.localStream;
  } catch (error) {
    console.error("Error getting local stream:", error);
    throw error;
  }
}

async getLocalAudioStream(): Promise<MediaStream> {
  console.log("Requesting audio-only user media");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const tracks = stream.getTracks();
    console.log("Local audio stream acquired, track details:");
    tracks.forEach((track, index) => {
      console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
    });
    if (tracks.length === 0) {
      console.error("No tracks found in local audio stream");
      throw new Error("No tracks found in local audio stream");
    }

    // Add tracks 
    if (this.singlePeerConnection) {
      tracks.forEach((track) => {
        if (!this.addedTrackIds.has(`single:${track.id}`)) {
          console.log(`Adding local audio track to single peer connection:`, track);
          this.singlePeerConnection.addTrack(track, stream);
          this.addedTrackIds.add(`single:${track.id}`);
        } else {
          console.log(`Skipping already added audio track for single:`, track.id);
        }
      });
    }

    return stream;
  } catch (error) {
    console.error("Error getting local audio stream:", error);
    throw error;
  }
}

  addTrack(targetId: string, track: MediaStreamTrack, stream: MediaStream): void {
    const peerConnection = this.peerConnections.get(targetId);
    if (!peerConnection) {
      console.error(`[ERROR] No peer connection for ${targetId}`);
      return;
    }
    try {
      peerConnection.addTrack(track, stream);
      console.log(`[DEBUG] Added track ${track.kind}:${track.id} to peer connection for ${targetId}`);
      console.log(`[DEBUG] Senders after addTrack for ${targetId}:`, peerConnection.getSenders().map(s => ({
        track: s.track ? { kind: s.track.kind, id: s.track.id } : null,
      })));
    } catch (error) {
      console.error(`[ERROR] Failed to add track ${track.kind}:${track.id} for ${targetId}:`, error);
    }
  }

  // Create offer
  async createOffer(targetId?: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = targetId ? this.peerConnections.get(targetId) : this.singlePeerConnection;
    if (!peerConnection) throw new Error(`Peer connection not initialized for ${targetId || "single"}`);
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log(`Offer created and local description set for ${targetId || "single"}:`, offer);
      console.log(`[DEBUG] Transceivers before offer for ${targetId}:`, peerConnection.getTransceivers().map(t => ({
        mid: t.mid,
        direction: t.direction,
        currentDirection: t.currentDirection,
        senderTrack: t.sender.track ? { kind: t.sender.track.kind, id: t.sender.track.id } : null,
      })));
      return offer;
    } catch (error) {
      console.error(`Error creating offer for ${targetId || "single"}:`, error);
      throw error;
    }
  }

  // Create answer
  async createAnswer(targetId?: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = targetId ? this.peerConnections.get(targetId) : this.singlePeerConnection;
    if (!peerConnection) throw new Error(`Peer connection not initialized for ${targetId || "single"}`);
    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`Answer created and set as local description for ${targetId || "single"}:`, answer);
      return answer;
    } catch (error) {
      console.error(`Error creating answer for ${targetId || "single"}:`, error);
      throw error;
    }
  }

  // Set remote description
  async setRemoteDescription(descriptionOrTargetId: string | RTCSessionDescriptionInit, description?: RTCSessionDescriptionInit): Promise<void> {
    if (typeof descriptionOrTargetId === "string") {
    const peerConnection = this.peerConnections.get(descriptionOrTargetId);
    if (!peerConnection) throw new Error(`Peer connection not initialized for ${descriptionOrTargetId}`);
    if (!description) throw new Error("Description is required for group calls");
    if (description.type === "answer" && peerConnection.signalingState === "stable") {
      console.log(`Ignoring duplicate answer for ${descriptionOrTargetId} in stable state`);
      return;
    }
    console.log(`Setting remote description for ${descriptionOrTargetId}:`, description);
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      console.log(`Remote description set successfully for ${descriptionOrTargetId}, signalingState:`, peerConnection.signalingState);
      // Process queued ICE candidates
      const queuedCandidates = this.pendingIceCandidates.get(descriptionOrTargetId);
      if (queuedCandidates) {
        for (const candidate of queuedCandidates) {
          console.log(`Processing queued ICE candidate for ${descriptionOrTargetId}:`, candidate);
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Queued ICE candidate added successfully for ${descriptionOrTargetId}`);
        }
        this.pendingIceCandidates.delete(descriptionOrTargetId);
      }
    } catch (error) {
      console.error(`Error setting remote description for ${descriptionOrTargetId}:`, error);
      throw error;
    }
  } else {
    if (!this.singlePeerConnection) throw new Error("Single peer connection not initialized");
    if (descriptionOrTargetId.type === "answer" && this.singlePeerConnection.signalingState === "stable") {
      console.log(`Ignoring duplicate answer for single peer connection in stable state`);
      return;
    }
    console.log("Setting remote description for single peer connection:", descriptionOrTargetId);
    try {
      await this.singlePeerConnection.setRemoteDescription(new RTCSessionDescription(descriptionOrTargetId));
      console.log(`Remote description set successfully for single, signalingState:`, this.singlePeerConnection.signalingState);
      // Process queued ICE candidates
      const queuedCandidates = this.pendingIceCandidates.get("single");
      if (queuedCandidates) {
        for (const candidate of queuedCandidates) {
          console.log(`Processing queued ICE candidate for single:`, candidate);
          await this.singlePeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Queued ICE candidate added successfully for single`);
        }
        this.pendingIceCandidates.delete("single");
      }
    } catch (error) {
      console.error("Error setting remote description for single peer connection:", error);
      throw error;
    }
  }
  }

  // Add ICE candidate
  async addIceCandidate(candidateOrTargetId: string | RTCIceCandidateInit, candidate?: RTCIceCandidateInit): Promise<void> {
    if (typeof candidateOrTargetId === "string") {
      const peerConnection = this.peerConnections.get(candidateOrTargetId);
      if (!peerConnection) throw new Error(`Peer connection not initialized for ${candidateOrTargetId}`);
      if (!candidate) throw new Error("Candidate is required for group calls");
      if (!peerConnection.remoteDescription) {
        console.log(`Queueing ICE candidate for ${candidateOrTargetId}, no remote description yet`);
        this.pendingIceCandidates.set(candidateOrTargetId, [
          ...(this.pendingIceCandidates.get(candidateOrTargetId) || []),
          candidate,
        ]);
        return;
      }
      console.log(`Adding ICE candidate for ${candidateOrTargetId}:`, candidate);
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`ICE candidate added successfully for ${candidateOrTargetId}`);
      } catch (error) {
        console.error(`Error adding ICE candidate for ${candidateOrTargetId}:`, error);
        throw error;
      }
    } else {
      if (!this.singlePeerConnection) throw new Error("Single peer connection not initialized");
      if (!this.singlePeerConnection.remoteDescription) {
        console.log(`Queueing ICE candidate for single, no remote description yet`);
        this.pendingIceCandidates.set("single", [
          ...(this.pendingIceCandidates.get("single") || []),
          candidateOrTargetId,
        ]);
        return;
      }
      console.log("Adding ICE candidate for single peer connection:", candidateOrTargetId);
      try {
        await this.singlePeerConnection.addIceCandidate(new RTCIceCandidate(candidateOrTargetId));
        console.log("ICE candidate added successfully for single");
      } catch (error) {
        console.error("Error adding ICE candidate for single peer connection:", error);
        throw error;
      }
    }
  }

  // Register ontrack callback
  onTrack(targetId: string, callback: (event: RTCTrackEvent, targetId: string) => void) {
    console.log(`[DEBUG] Registering ontrack callback for ${targetId}`);
    this.onTrackCallbacks.set(targetId, callback);
    const peerConnection = this.peerConnections.get(targetId);
    if (peerConnection) {
      peerConnection.ontrack = (event) => {
        console.log(`[DEBUG] ontrack event for ${targetId}:`, {
          streams: event.streams.map(s => ({
            id: s.id,
            tracks: s.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled, readyState: t.readyState })),
          })),
          track: { kind: event.track.kind, id: event.track.id, enabled: event.track.enabled, readyState: event.track.readyState },
        });
        callback(event, targetId);
      };
    }
  }

  // Register onicecandidate callback
  onIceCandidate(targetId: string, callback: (candidate: RTCIceCandidateInit) => void) {
    console.log(`Registering onicecandidate callback for ${targetId}`);
    this.onIceCandidateCallbacks.set(targetId, callback);
  }

  // Close a specific peer connection
  closePeerConnection(targetId: string): void {
    const peerConnection = this.peerConnections.get(targetId);
    if (!peerConnection) {
      console.log(`No peer connection found for ${targetId}, skipping close`);
      return;
    }
    try {
      peerConnection.close();
      console.log(`Closed peer connection for ${targetId}, connectionState: ${peerConnection.connectionState}`);
      this.peerConnections.delete(targetId);
      this.onTrackCallbacks.delete(targetId);
      this.onIceCandidateCallbacks.delete(targetId);
      this.isOffererMap.delete(targetId);
      this.pendingIceCandidates.delete(targetId);
      console.log(`Cleaned up peer connection resources for ${targetId}`);
    } catch (error) {
      console.error(`Error closing peer connection for ${targetId}:`, error);
    }
  }

  // Stop all peer connections and clear callbacks
  stop(): void {
    console.log("Stopping WebRTC service");
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        console.log("Stopping local track:", track);
        track.stop();
      });
      this.localStream = null;
    }
    if (this.singlePeerConnection) {
      console.log("Closing single peer connection");
      this.singlePeerConnection.close();
      this.singlePeerConnection = null;
    }
    this.peerConnections.forEach((peerConnection, targetId) => {
      console.log(`Closing peer connection for ${targetId}`);
      peerConnection.close();
    });
    this.peerConnections.clear();
    this.addedTrackIds.clear();
    this.onTrackCallbacks.clear();
    this.onIceCandidateCallbacks.clear();
    this.isOffererMap.clear();
    this.onNegotiationNeeded = undefined;
    this.pendingIceCandidates.clear();
    console.log("WebRTC service stopped");
  }

  // Get peer connection
  getPeerConnection(targetId?: string): RTCPeerConnection | null {
    if (!targetId) {
      return this.singlePeerConnection;
    }
    return this.peerConnections.get(targetId) || null;
  }

  // Get local stream
  getCurrentLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
