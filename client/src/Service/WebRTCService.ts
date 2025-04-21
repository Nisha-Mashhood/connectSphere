export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
  
    constructor() {
      console.log("WebRTCService initialized");
    }
  
    async initPeerConnection(): Promise<void> {
      const config: RTCConfiguration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };
      console.log("Initializing peer connection with config:", config);
  
      try {
        this.peerConnection = new RTCPeerConnection(config);
        this.peerConnection.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", this.peerConnection!.iceConnectionState);
          if (this.peerConnection!.iceConnectionState === "failed") {
            console.error("ICE connection failed, restarting ICE");
            this.peerConnection!.restartIce();
          }
        };
        this.peerConnection.onconnectionstatechange = () => {
          console.log("Connection state:", this.peerConnection!.connectionState);
        };
        this.peerConnection.onnegotiationneeded = async () => {
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
  
    // if remote description is set
    hasRemoteDescription(): boolean {
      if (!this.peerConnection) {
        console.log("No peer connection exists");
        return false;
      }
      const hasRemoteDesc = !!this.peerConnection.remoteDescription;
      console.log(`Remote description exists: ${hasRemoteDesc}, signalingState: ${this.peerConnection.signalingState}`);
      return hasRemoteDesc;
    }
  
    async getLocalStream(): Promise<MediaStream> {
      console.log("Requesting user media (video and audio)");
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: true,
        });
        const tracks = this.localStream.getTracks();
        console.log("Local stream acquired, track details:");
        tracks.forEach((track, index) => {
          console.log(`Track ${index}: kind=${track.kind}, id=${track.id}, enabled=${track.enabled}, readyState=${track.readyState}`);
        });
        if (tracks.length === 0) {
          console.error("No tracks found in local stream");
        }
  
        if (this.peerConnection) {
          this.localStream.getTracks().forEach((track) => {
            console.log("Adding local track to peer connection:", track);
            this.peerConnection!.addTrack(track, this.localStream!);
          });
        }
  
        return this.localStream;
      } catch (error) {
        console.error("Error getting local stream:", error);
        throw error;
      }
    }
  
    async createOffer(): Promise<RTCSessionDescriptionInit> {
      if (!this.peerConnection) throw new Error("Peer connection not initialized");
      try {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        console.log("Offer created and local description set:", offer);
        return offer;
      } catch (error) {
        console.error("Error creating offer:", error);
        throw error;
      }
    }
  
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
      console.log("WebRTC service stopped");
    }
  
    // Expose peerConnection for event handlers
    getPeerConnection(): RTCPeerConnection | null {
      return this.peerConnection;
    }
  }