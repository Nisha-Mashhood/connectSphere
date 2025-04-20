export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Free Google STUN server
    ],
  };

  constructor() {
    console.log("WebRTCService initialized");
  }

  // Initialize peer connection
  async initPeerConnection(): Promise<void> {
    try {
      console.log("Initializing peer connection with config:", this.configuration);
      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Log ICE candidate events
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE candidate generated:", event.candidate);
        } else {
          console.log("ICE candidate gathering complete");
        }
      };

      // Log connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log("Peer connection state:", this.peerConnection?.connectionState);
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log("Received remote track:", event.streams[0]);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
      };

      console.log("Peer connection initialized successfully");
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      throw error;
    }
  }

  // Get user media (camera and microphone)
  async getLocalStream(): Promise<MediaStream> {
    try {
      console.log("Requesting user media (video and audio)");
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Local stream acquired:", this.localStream.getTracks());

      // Add local stream tracks to peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          console.log("Adding local track to peer connection:", track);
          this.peerConnection.addTrack(track, this.localStream!);
        });
      }

      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  }

  // Getters for streams
  getCurrentLocalStream(): MediaStream | null {
    console.log("Getting current local stream:", this.localStream);
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    console.log("Getting remote stream:", this.remoteStream);
    return this.remoteStream;
  }

  // Cleanup
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
    this.remoteStream = null;
    console.log("WebRTC service stopped");
  }
}