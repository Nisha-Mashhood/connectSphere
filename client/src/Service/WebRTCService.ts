export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;//  Peer connection instance
  private localStream: MediaStream | null = null;// Local media stream (video/audio)
  private hasCreatedOffer: boolean = false;// Flag to ensure offer is created only once
  private addedTrackIds: Set<string> = new Set(); // Set to track added track IDs and avoid duplicates

  constructor() {
    console.log("WebRTCService initialized");
  }
 // Initialize the peer connection with ICE servers
  async initPeerConnection(): Promise<void> {
    // Skip if already initialized and not closed
    if (this.peerConnection && this.peerConnection.connectionState !== "closed") {
      console.log("Peer connection already initialized, skipping");
      return;
    }

    // STUN and TURN server configuration
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
    console.log("Initializing peer connection with config:", config);

    try {
      this.peerConnection = new RTCPeerConnection(config);

      // Detects ICE failures and can trigger reconnection.
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", this.peerConnection!.iceConnectionState);
        if (this.peerConnection!.iceConnectionState === "failed") {
          console.error("ICE connection failed, restarting ICE");
          this.peerConnection!.restartIce();// Try to reconnect ICE
        }
      };
      // Logs connection state (e.g., connected, failed).
      this.peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", this.peerConnection!.connectionState);
      };

      // When a new media track is added, it creates an offer (if not already done).
      this.peerConnection.onnegotiationneeded = async () => {
        if (this.hasCreatedOffer) {
          console.log("Ignoring onnegotiationneeded: Initial offer already created");
          return;
        }
        console.log("Negotiation needed, creating offer");
        try {
          const offer = await this.peerConnection!.createOffer();
          await this.peerConnection!.setLocalDescription(offer);
          console.log("Local description set for negotiation:", offer);
        } catch (error) {
          console.error("Error handling negotiation:", error);
        }
      };
      console.log("Peer connection initialized successfully");
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      throw error;
    }
  }

   // Checks if the remote offer/answer is already set
  hasRemoteDescription(): boolean {
    if (!this.peerConnection) {
      console.log("No peer connection exists");
      return false;
    }
    const hasRemoteDesc = !!this.peerConnection.remoteDescription;
    console.log(`Remote description exists: ${hasRemoteDesc}, signalingState: ${this.peerConnection.signalingState}`);
    return hasRemoteDesc;
  }

  // Accesses the user’s camera and microphone
  async getLocalStream(): Promise<MediaStream> {
    console.log("Requesting user media (video and audio)");
    try {
      // If not already fetched, request stream
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: true,
        });
      }
      const tracks = this.localStream.getTracks();
      console.log("Local stream acquired, track details:");
      tracks.forEach((track, index) => {  //Logs each track.
        console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
      });
      if (tracks.length === 0) {
        console.error("No tracks found in local stream");
      }

       // Adds tracks to the peer connection if they aren’t already added.
      if (this.peerConnection) {
        tracks.forEach((track) => {
          if (!this.addedTrackIds.has(track.id)) {
            console.log("Adding local track to peer connection:", track);
            this.peerConnection!.addTrack(track, this.localStream!);
            this.addedTrackIds.add(track.id);
          } else {
            console.log("Skipping already added track:", track.id);
          }
        });
      }

      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  }

  // Get audio-only stream and attach it to peer connection
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
      }

      if (this.peerConnection) {
        tracks.forEach((track) => {
          if (!this.addedTrackIds.has(track.id)) {
            console.log("Adding local audio track to peer connection:", track);
            this.peerConnection!.addTrack(track, stream);
            this.addedTrackIds.add(track.id);
          } else {
            console.log("Skipping already added audio track:", track.id);
          }
        });
      }

      return stream;
    } catch (error) {
      console.error("Error getting local audio stream:", error);
      throw error;
    }
  }

  // Creates a WebRTC offer to start a connection
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error("Peer connection not initialized");
    if (this.hasCreatedOffer) {
      console.warn("Offer already created, returning existing offer");
      return this.peerConnection.localDescription!;
    }
    try {
      const offer = await this.peerConnection.createOffer();  //generate an SDP.
      await this.peerConnection.setLocalDescription(offer);
      console.log("Offer created and local description set:", offer);
      this.hasCreatedOffer = true;  //prevent duplicates.
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  // Responds to an offer from a remote peer
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }
    console.log("Creating answer");
    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log("Answer created and set as local description:", answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  // Applies an offer or answer received from the remote peer
  //Used after receiving the other peer's SDP via a signaling server.
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }
    console.log("Setting remote description:", description);
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
      console.log("Remote description set successfully, signalingState:", this.peerConnection.signalingState);
    } catch (error) {
      console.error("Error setting remote description:", error);
      throw error;
    }
  }

   // Adds a discovered ICE candidate received from the signaling server
   //ICE candidates = IP + port combinations used to connect peers.
  //These are exchanged to help devices find the best network path to each other.
  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }
    console.log("Adding ICE candidate:", candidate);
    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log("ICE candidate added successfully");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
      throw error;
    }
  }

   // Stop and cleanup everything: media streams and peer connection
  stop(): void {
    console.log("Stopping WebRTC service");
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        console.log("Stopping local track:", track);
        track.stop();
      });
      this.localStream = null;
    }
    if (this.peerConnection) {
      console.log("Closing peer connection");
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.hasCreatedOffer = false;
    this.addedTrackIds.clear();
    console.log("WebRTC service stopped");
  }

  // Get current peer connection instance
  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }
}