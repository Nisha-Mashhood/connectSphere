import React, { useEffect, useRef, useState, RefObject } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { WebRTCService } from "../../../../../Service/WebRTCService";
import { socketService } from "../../../../../Service/SocketService";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  GroupCallData,
  GroupOfferData,
  GroupAnswerData,
  GroupIceCandidateData,
} from "../../../../../types";

interface GroupCallProps {
  groupId: string;
  userId: string;
  callType: "audio" | "video";
}

const GroupCall = React.forwardRef<
  { startGroupCall: (type: "audio" | "video") => void },
  GroupCallProps
>(({ groupId, userId }, ref) => {
  const localStream = useRef<MediaStream | null>(null);
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{
    groupId: string;
    initiatorId: string;
    callType: "audio" | "video";
    callId: string;
  } | null>(null);
  const [currentCallType, setCurrentCallType] = useState<
    "audio" | "video" | null
  >(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [joinedMembers, setJoinedMembers] = useState<string[]>([]);
  const [initiatorId, setInitiatorId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const webRTCServiceRef = useRef(new WebRTCService());
  const callIdRef = useRef<string | null>(null);
  const callTypeRef = useRef<"audio" | "video" | null>(null);
  const initiatorIdRef = useRef<string | null>(null);
  // const pendingUserJoins = useRef<string[]>([]);
  const pendingOffers = useRef<GroupOfferData[]>([]);
  const [hasJoinedCall, setHasJoinedCall] = useState<string | null>(null);
  const isStreamReady = useRef<boolean>(false);

  const acquireLocalStream = async (
    type: "audio" | "video"
  ): Promise<MediaStream | null> => {
    try {
      const webRTCService = webRTCServiceRef.current;
      const stream =
        type === "video"
          ? await webRTCService.getLocalStream()
          : await webRTCService.getLocalAudioStream();
      const tracks = stream.getTracks();
      console.log(
        ` Acquired ${type} stream, stream: ${stream.id}, tracks:`,
        tracks.map((track) => ({
          kind: track.kind,
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
          label: track.label,
        }))
      );
      const expectedTracks = type === "video" ? ["audio", "video"] : ["audio"];
      const actualTracks = tracks.map((t) => t.kind);
      if (!expectedTracks.every((kind) => actualTracks.includes(kind))) {
        console.error(
          ` Invalid stream: expected tracks ${expectedTracks}, got ${actualTracks}`
        );
        toast.error(`Invalid ${type} stream: missing required tracks`);
        return null;
      }
      localStream.current = stream;
      isStreamReady.current = true;
      console.log(`Stream acquired, isStreamReady set to true`);
      return stream;
    } catch (error) {
      console.error(` Error acquiring ${type} stream:`, error);
      toast.error(`Failed to acquire ${type} stream. Check permissions.`);
      isStreamReady.current = false;
      return null;
    }
  };

  const playLocalStream = async () => {
    if (!localVideoRef.current || !localStream.current) {
      console.warn("Cannot play stream: video ref or stream is missing");
      return;
    }
    try {
      localVideoRef.current.srcObject = localStream.current;
      console.log(
        "Assigned local stream to video element, tracks:",
        localStream.current.getTracks().map((track) => ({
          kind: track.kind,
          id: track.id,
          readyState: track.readyState,
        }))
      );
      await localVideoRef.current.play();
      console.log("Local video playback started");
    } catch (err) {
      console.error("Error playing local video:", err);
      toast.error("Failed to play local video.");
      setTimeout(playLocalStream, 500);
    }
  };

  const clearVideoStream = () => {
    if (localVideoRef.current && !localStream.current) {
      localVideoRef.current.srcObject = null;
      console.log("Cleared local video stream");
    }
  };

  const initializeStream = async () => {
    if (!callTypeRef.current) {
      console.warn("No call type set for stream initialization");
      return;
    }
    console.log(`Initializing stream for callType: ${callTypeRef.current}`);
    const stream = await acquireLocalStream(callTypeRef.current);
    if (!stream) {
      setIsModalOpen(false);
      toast.error("Modal closed due to stream acquisition failure");
      return;
    }
  };

  const createPeerConnection = async (
    remoteUserId: string,
    isOfferer: boolean = false,
    callIdToUse: string
  ) => {
    if (webRTCServiceRef.current.getPeerConnection(remoteUserId)) {
      console.log(`Peer connection already exists for ${remoteUserId}`);
      return;
    }
    // Wait for stream to be ready if not already
    if (!isStreamReady.current) {
      console.log(`Waiting for local stream to be ready for ${remoteUserId}`);
      await new Promise<void>((resolve) => {
        const checkStream = () => {
          if (isStreamReady.current) {
            resolve();
          } else {
            setTimeout(checkStream, 100);
          }
        };
        checkStream();
      });
    }

    try {
      console.log(
        `Creating peer connection for user ${remoteUserId}, isOfferer: ${isOfferer}, callId: ${callIdToUse}`
      );
      await webRTCServiceRef.current.initPeerConnection(
        remoteUserId,
        isOfferer
      );
      const peerConnection =
        webRTCServiceRef.current.getPeerConnection(remoteUserId);
      if (!peerConnection) {
        console.error(
          `Failed to initialize peer connection for ${remoteUserId}`
        );
        throw new Error(
          `Failed to initialize peer connection for ${remoteUserId}`
        );
      }

      console.log(
        `Local stream before transceiver setup for ${remoteUserId}:`,
        localStream.current
          ? localStream.current.getTracks().map((t) => ({
              kind: t.kind,
              id: t.id,
              enabled: t.enabled,
              readyState: t.readyState,
            }))
          : null
      );

      // Only add tracks/transceivers for offerer (before creating offer)
      if (isOfferer && localStream.current && callTypeRef.current) {
        console.log(
          ` Setting up sendrecv transceivers and tracks for ${remoteUserId}`
        );
        const tracks = localStream.current.getTracks();
        console.log(
          ` Local stream for ${remoteUserId}, stream: ${localStream.current.id}, tracks:`,
          {
            tracks: tracks.map((t) => ({
              kind: t.kind,
              id: t.id,
              enabled: t.enabled,
              readyState: t.readyState,
            })),
          }
        );
        if (tracks.length === 0) {
          console.error(` No tracks in local stream for ${remoteUserId}`);
          toast.error(`No tracks available for ${remoteUserId}`);
          return;
        }

        // Add transceivers if needed
        const existingTransceivers = peerConnection.getTransceivers();
        if (
          !existingTransceivers.some((t) => t.sender.track?.kind === "audio")
        ) {
          peerConnection.addTransceiver("audio", { direction: "sendrecv" });
        }
        if (
          callTypeRef.current === "video" &&
          !existingTransceivers.some((t) => t.sender.track?.kind === "video")
        ) {
          peerConnection.addTransceiver("video", { direction: "sendrecv" });
        }

        // Add tracks
        tracks.forEach((track) => {
          const existingSender = peerConnection
            .getSenders()
            .find((s) => s.track?.id === track.id);
          if (!existingSender) {
            webRTCServiceRef.current.addTrack(
              remoteUserId,
              track,
              localStream.current!
            );
            console.log(
              ` Added track ${track.kind}:${track.id} for ${remoteUserId}`
            );
          } else {
            console.log(
              ` Skipping already added track ${track.kind}:${track.id} for ${remoteUserId}`
            );
          }
        });

        // Set directions
        const transceivers = peerConnection.getTransceivers();
        transceivers.forEach((t) => {
          if (t.sender.track && t.direction !== "sendrecv") {
            console.log(
              ` Setting transceiver to sendrecv for ${t.sender.track.kind} track: ${t.sender.track.id}`
            );
            t.direction = "sendrecv";
          }
        });

        console.log(
          ` Transceivers after setup for ${remoteUserId}:`,
          transceivers.map((t) => ({
            mid: t.mid,
            direction: t.direction,
            currentDirection: t.currentDirection,
            senderTrack: t.sender.track
              ? { kind: t.sender.track.kind, id: t.sender.track.id }
              : null,
          }))
        );
      } else if (!isOfferer) {
        console.log(
          `Skipping track addition for answerer ${remoteUserId}; will add after setRemoteDescription`
        );
      } else {
        console.error(
          ` No localStream or callType for ${remoteUserId}, falling back to recvonly`
        );
        const existingTransceivers = peerConnection.getTransceivers();
        if (
          !existingTransceivers.some((t) => t.sender.track?.kind === "audio")
        ) {
          peerConnection.addTransceiver("audio", { direction: "recvonly" });
        }
        if (
          callTypeRef.current === "video" &&
          !existingTransceivers.some((t) => t.sender.track?.kind === "video")
        ) {
          peerConnection.addTransceiver("video", { direction: "recvonly" });
        }
        console.log(
          ` Added recvonly transceivers for receiving streams from ${remoteUserId}`
        );
      }

      console.log(
        `Peer connection initialized for ${remoteUserId}: signalingState=${peerConnection.signalingState}, iceConnectionState=${peerConnection.iceConnectionState}`
      );
      console.log(
        `Transceivers for ${remoteUserId}:`,
        peerConnection.getTransceivers().map((t) => ({
          mid: t.mid,
          direction: t.direction,
          currentDirection: t.currentDirection,
          senderTrack: t.sender.track
            ? { kind: t.sender.track.kind, id: t.sender.track.id }
            : null,
        }))
      );
      console.log(
        `Senders for ${remoteUserId}:`,
        peerConnection.getSenders().map((s) => ({
          track: s.track ? { kind: s.track.kind, id: s.track.id } : null,
        }))
      );

      peerConnection.onnegotiationneeded = async () => {
        if (!isOfferer) {
          console.log(
            `Negotiation needed for ${remoteUserId}, but not an offerer, skipping`
          );
          return;
        }
        try {
          if (peerConnection.signalingState !== "stable") {
            console.log(
              `Rolling back for ${remoteUserId} due to signaling state: ${peerConnection.signalingState}`
            );
            await peerConnection.setLocalDescription({ type: "rollback" });
          }
          console.log(`Negotiation needed for ${remoteUserId}, creating offer`);
          const offer = await webRTCServiceRef.current.createOffer(
            remoteUserId
          );
          if (offer) {
            console.log(
              `Sending offer from onnegotiationneeded to ${remoteUserId}, callId: ${callIdToUse}`
            );
            socketService.sendGroupOffer({
              groupId,
              callId: callIdToUse,
              callType: callTypeRef.current!,
              senderId: userId,
              recipientId: remoteUserId,
              offer,
              type: "group",
            });
          }
        } catch (error) {
          console.error(
            `Error in onnegotiationneeded for ${remoteUserId}:`,
            error
          );
        }
      };

      webRTCServiceRef.current.onIceCandidate(remoteUserId, (candidate) => {
        if (candidate.candidate === "") {
          console.log(`ICE gathering complete for ${remoteUserId}`);
          return;
        }
        console.log(
          `Emitting ICE candidate to ${remoteUserId} for callId: ${callIdToUse}`
        );
        socketService.sendGroupIceCandidate({
          groupId,
          callId: callIdToUse,
          senderId: userId,
          recipientId: remoteUserId,
          candidate,
          callType: callTypeRef.current!,
          type: "group",
        });
      });

      webRTCServiceRef.current.onTrack(remoteUserId, (event, targetId) => {
        console.log(` Received remote track from ${targetId}, track:`, {
          kind: event.track.kind,
          id: event.track.id,
          enabled: event.track.enabled,
          readyState: event.track.readyState,
          streams: event.streams.map((s) => ({
            id: s.id,
            tracks: s.getTracks().map((t) => ({ kind: t.kind, id: t.id })),
          })),
        });
        if (event.track.kind === "video") {
          console.log(`Video track details for ${targetId}:`, {
            muted: event.track.muted,
            enabled: event.track.enabled,
            readyState: event.track.readyState,
            width: event.track.getSettings().width,
            height: event.track.getSettings().height,
            frameRate: event.track.getSettings().frameRate,
          });
          // Log negotiated codec
          const peerConnection =
            webRTCServiceRef.current.getPeerConnection(targetId);
          if (peerConnection) {
            const transceiver = peerConnection
              .getTransceivers()
              .find((t) => t.receiver.track === event.track);
            if (transceiver) {
              const capabilities = RTCRtpReceiver.getCapabilities("video");
              if (capabilities && capabilities.codecs) {
                console.log(
                  `Available video codecs for ${targetId}:`,
                  capabilities.codecs.map((c) => c.mimeType)
                );
              } else {
                console.log(
                  `No video codec capabilities available for ${targetId}`
                );
              }
            }
          }
        }
        if (!event.streams || event.streams.length === 0) {
          console.warn(`No streams received for ${targetId}, track:`, {
            kind: event.track.kind,
            id: event.track.id,
            enabled: event.track.enabled,
            readyState: event.track.readyState,
          });
          return;
        }
        const remoteStream = event.streams[0];
        console.log(
          ` Received remote stream from ${targetId}, stream tracks:`,
          remoteStream.getTracks().map((t) => ({
            kind: t.kind,
            id: t.id,
            enabled: t.enabled,
            readyState: t.readyState,
          }))
        );
        remoteStreams.current.set(targetId, remoteStream);

        setJoinedMembers((prev) =>
          prev.includes(targetId) ? prev : [...prev, targetId]
        );

        const remoteVideo = remoteVideoRefs.current.get(targetId);
        if (remoteVideo) {
          if (remoteVideo.srcObject !== remoteStream) {
            console.log(
              ` Setting remoteVideo.srcObject for ${targetId}, stream: ${remoteStream.id}`
            );
            remoteVideo.srcObject = remoteStream;
            remoteVideo
              .play()
              .then(() => {
                console.log(` Remote video playing for ${targetId}`);
              })
              .catch((err) => {
                console.error(
                  `Error playing remote video for ${targetId}:`,
                  err
                );
                toast.error(`Failed to play remote video for ${targetId}`);
              });
          } else {
            console.log(
              ` Skipping redundant srcObject assignment for ${targetId}, stream: ${remoteStream.id}`
            );
          }
        } else {
          console.log(
            ` No video element yet for ${targetId}, stream stored for later attachment`
          );
        }
        if (peerConnection && event.track.kind === "video") {
          setInterval(() => {
            peerConnection.getStats().then((stats) => {
              stats.forEach((report) => {
                if (
                  report.type === "track" &&
                  report.kind === "video" &&
                  report.trackId === event.track.id
                ) {
                  console.log(`Video track stats for ${targetId}:`, {
                    framesReceived: report.framesReceived,
                    bytesReceived: report.bytesReceived,
                    packetsReceived: report.packetsReceived,
                    packetsLost: report.packetsLost,
                  });
                }
              });
            });
          }, 2000);
        }
      });
    } catch (error) {
      console.error(
        `Error creating peer connection for ${remoteUserId}:`,
        error
      );
      toast.error(`Failed to create peer connection for ${remoteUserId}`);
    }
  };

  const handleGroupOffer = async (data: GroupOfferData) => {
    if (
      data.groupId !== groupId ||
      data.callId !== callIdRef.current ||
      data.recipientId !== userId
    ) {
      console.log(
        `Ignoring group offer: groupId=${data.groupId}, callId=${data.callId}, recipientId=${data.recipientId}, expected callId=${callIdRef.current}`
      );
      return;
    }
    if (!callIdRef.current || !callTypeRef.current || !isStreamReady.current) {
      console.log(
        `Queuing offer from ${data.senderId} because callId, callType, or stream is missing`
      );
      pendingOffers.current.push(data);
      return;
    }
    console.log(
      `Received group offer from ${data.senderId} for callId: ${data.callId}`,
      data.offer
    );
    try {
      if (!webRTCServiceRef.current.getPeerConnection(data.senderId)) {
        await createPeerConnection(data.senderId, false, data.callId);
      }
      let peerConnection = webRTCServiceRef.current.getPeerConnection(
        data.senderId
      );
      if (!peerConnection) {
        console.log(`No peer connection for ${data.senderId}, creating one`);
        await createPeerConnection(data.senderId, false, data.callId);
        peerConnection = webRTCServiceRef.current.getPeerConnection(
          data.senderId
        );
        if (!peerConnection) {
          throw new Error(
            `Failed to create peer connection for ${data.senderId}`
          );
        }
      }
      if (peerConnection.signalingState !== "stable") {
        console.log(
          `Rolling back for ${data.senderId} due to signaling state: ${peerConnection.signalingState}`
        );
        await peerConnection.setLocalDescription({ type: "rollback" });
      }

      // Set remote description FIRST
      await webRTCServiceRef.current.setRemoteDescription(
        data.senderId,
        data.offer
      );
      console.log(
        `Remote offer set for ${data.senderId}, signalingState=${peerConnection.signalingState}`
      );

      // Add local tracks AFTER setRemoteDescription
      if (localStream.current && callTypeRef.current) {
        console.log(
          ` Adding local tracks for ${data.senderId} AFTER setRemoteDescription`
        );
        const tracks = localStream.current.getTracks();
        const transceivers = peerConnection.getTransceivers();

        tracks.forEach((track) => {
          // Find matching transceiver (created by setRemoteDescription, with receiver but no sender)
          const transceiver = transceivers.find(
            (t) => t.receiver.track.kind === track.kind && !t.sender.track
          );
          if (transceiver) {
            // Associate local track with sender
            transceiver.sender.replaceTrack(track);
            if (transceiver.direction !== "sendrecv") {
              console.log(
                ` Setting transceiver to sendrecv for ${track.kind} track: ${track.id}`
              );
              transceiver.direction = "sendrecv";
            }
            console.log(
              ` Associated track ${track.kind}:${track.id} with transceiver for ${data.senderId}`
            );
          } else {
            // Fallback: add new track (shouldn't happen if offer has matching m-lines)
            webRTCServiceRef.current.addTrack(
              data.senderId,
              track,
              localStream.current!
            );
            console.log(
              ` Added new track ${track.kind}:${track.id} for ${data.senderId} (no matching transceiver)`
            );
          }
        });

        // Log transceivers after adding tracks
        console.log(
          ` Transceivers after adding tracks for ${data.senderId}:`,
          transceivers.map((t) => ({
            mid: t.mid,
            direction: t.direction,
            currentDirection: t.currentDirection,
            senderTrack: t.sender.track
              ? { kind: t.sender.track.kind, id: t.sender.track.id }
              : null,
          }))
        );
      } else {
        console.error(
          ` No localStream or callType for ${data.senderId}, cannot set sendrecv`
        );
        toast.error(`Cannot send media to ${data.senderId}: stream not ready`);
        return;
      }

      const answer = await webRTCServiceRef.current.createAnswer(data.senderId);
      console.log(
        `Created and set local answer for ${data.senderId}, signalingState=${peerConnection.signalingState}`,
        answer.sdp
      );
      socketService.sendGroupAnswer({
        groupId,
        callId: data.callId,
        callType: callTypeRef.current!,
        senderId: userId,
        recipientId: data.senderId,
        answer,
        type: "group",
      });
      console.log(
        `Sent group answer to ${data.senderId} for callId: ${data.callId}`
      );
    } catch (error) {
      console.error(`Error handling group offer from ${data.senderId}:`, error);
      toast.error(`Failed to handle offer from ${data.senderId}`);
    }
  };

  const handleGroupAnswer = async (data: GroupAnswerData) => {
    if (
      data.groupId !== groupId ||
      data.callId !== callIdRef.current ||
      data.recipientId !== userId
    ) {
      console.log(
        `Ignoring group answer: groupId=${data.groupId}, callId=${data.callId}, recipientId=${data.recipientId}, expected callId=${callIdRef.current}`
      );
      return;
    }
    console.log(
      `Received group answer from ${data.senderId} for callId: ${data.callId}`
    );
    try {
      const peerConnection = webRTCServiceRef.current.getPeerConnection(
        data.senderId
      );
      if (!peerConnection) {
        throw new Error(`No peer connection found for ${data.senderId}`);
      }
      if (peerConnection.signalingState !== "have-local-offer") {
        console.log(
          `Rolling back for ${data.senderId} due to signaling state: ${peerConnection.signalingState}`
        );
        await peerConnection.setLocalDescription({ type: "rollback" });
      }
      await webRTCServiceRef.current.setRemoteDescription(
        data.senderId,
        data.answer
      );
      console.log(
        `Remote answer set for ${data.senderId}, signalingState=${peerConnection.signalingState}`
      );
    } catch (error) {
      console.error(
        `Error handling group answer from ${data.senderId}:`,
        error
      );
      toast.error(`Failed to handle answer from ${data.senderId}`);
    }
  };

  const handleGroupIceCandidate = async (data: GroupIceCandidateData) => {
    if (
      data.groupId !== groupId ||
      data.callId !== callIdRef.current ||
      data.recipientId !== userId
    ) {
      console.log(
        `Ignoring ICE candidate: groupId=${data.groupId}, callId=${data.callId}, recipientId=${data.recipientId}, expected callId=${callIdRef.current}`
      );
      return;
    }
    console.log(
      `Received ICE candidate from ${data.senderId} for callId: ${data.callId}`
    );
    try {
      const peerConnection = webRTCServiceRef.current.getPeerConnection(
        data.senderId
      );
      if (!peerConnection) {
        throw new Error(`No peer connection found for ${data.senderId}`);
      }
      await webRTCServiceRef.current.addIceCandidate(
        data.senderId,
        data.candidate
      );
      console.log(`Added ICE candidate for ${data.senderId}`);
    } catch (error) {
      console.error(
        `Error handling ICE candidate from ${data.senderId}:`,
        error
      );
      toast.error(`Failed to handle ICE candidate from ${data.senderId}`);
    }
  };

  const handleJoinedGroupCall = async (data: {
    groupId: string;
    callId: string;
    callType: "audio" | "video";
    participants: string[];
  }) => {
    if (data.groupId !== groupId || data.callId !== callIdRef.current) {
      console.log(
        `Ignoring joinedGroupCall: groupId=${data.groupId}, callId=${data.callId}, expected callId=${callIdRef.current}`
      );
      return;
    }
    console.log(
      `Received joinedGroupCall with participants: ${data.participants}`
    );
    setJoinedMembers((prev) => [
      ...new Set([...prev, userId, ...data.participants]),
    ]);

    // Create peer connections for all existing participants
    data.participants.forEach((participantId: string) => {
      if (
        participantId !== userId &&
        !webRTCServiceRef.current.getPeerConnection(participantId)
      ) {
        console.log(
          `Creating peer connection for existing participant ${participantId}`
        );
        createPeerConnection(participantId, false, data.callId);
      }
    });

    // Clear pendingUserJoins to avoid duplicate processing
    // pendingUserJoins.current = [];
    // console.log("Cleared pendingUserJoins after processing joinedGroupCall");

    // Process pending offers now that we're ready
    if (pendingOffers.current.length > 0) {
      console.log(
        `Processing queued offers after joinedGroupCall: ${pendingOffers.current.map(
          (o) => o.senderId
        )}`
      );
      for (const offer of pendingOffers.current) {
        if (
          offer.groupId === groupId &&
          offer.callId === callIdRef.current &&
          offer.recipientId === userId
        ) {
          try {
            if (!webRTCServiceRef.current.getPeerConnection(offer.senderId)) {
              await createPeerConnection(offer.senderId, false, offer.callId);
            }
            const peerConnection = webRTCServiceRef.current.getPeerConnection(
              offer.senderId
            );
            if (!peerConnection) {
              throw new Error(`No peer connection found for ${offer.senderId}`);
            }
            if (peerConnection.signalingState !== "stable") {
              console.log(
                `Rolling back for ${offer.senderId} due to signaling state: ${peerConnection.signalingState}`
              );
              await peerConnection.setLocalDescription({ type: "rollback" });
            }
            await webRTCServiceRef.current.setRemoteDescription(
              offer.senderId,
              offer.offer
            );
            console.log(
              `Remote offer set for ${offer.senderId}, signalingState=${peerConnection.signalingState}`
            );
            const answer = await webRTCServiceRef.current.createAnswer(
              offer.senderId
            );
            console.log(
              `Created and set local answer for ${offer.senderId}, signalingState=${peerConnection.signalingState}`
            );
            socketService.sendGroupAnswer({
              groupId,
              callId: offer.callId,
              callType: callTypeRef.current,
              senderId: userId,
              recipientId: offer.senderId,
              answer,
              type: "group",
            });
            console.log(
              `Sent group answer to ${offer.senderId} for callId: ${offer.callId}`
            );
          } catch (error) {
            console.error(
              `Error processing queued offer from ${offer.senderId}:`,
              error
            );
            toast.error(`Failed to process offer from ${offer.senderId}`);
          }
        }
      }
      pendingOffers.current = [];
    }
  };
  const handleUserRoomLeft = (data: { userId: string }) => {
    if (data.userId !== userId && joinedMembers.includes(data.userId)) {
      console.log(`User ${data.userId} left group call for group ${groupId}`);
      setJoinedMembers((prev) => prev.filter((id) => id !== data.userId));
      webRTCServiceRef.current.closePeerConnection(data.userId);
      remoteStreams.current.delete(data.userId);
      const remoteVideo = remoteVideoRefs.current.get(data.userId);
      if (remoteVideo) {
        remoteVideo.srcObject = null;
      }
      remoteVideoRefs.current.delete(data.userId);
      console.log(`Cleaned up peer connection and video for ${data.userId}`);
    }
  };

  const handleUserRoomJoined = (data: { userId: string }) => {
    console.log(`User ${data.userId} joined group call for group ${groupId}`);
    if (data.userId === userId || joinedMembers.includes(data.userId)) {
      return;
    }
    setJoinedMembers((prev) => [...new Set([...prev, data.userId])]);

    if (data.userId !== userId) {
      const isOfferer = userId < data.userId;
      console.log(
        `Creating peer connection for new user ${data.userId}, acting as ${
          isOfferer ? "offerer" : "answerer"
        }`
      );
      if (callIdRef.current) {
        createPeerConnection(data.userId, isOfferer, callIdRef.current);
      } else {
        console.warn(
          `Cannot create peer connection for ${data.userId}: callIdRef is null`
        );
        toast.error(
          `Failed to connect with ${data.userId}: call not initialized`
        );
      }
    }
  };

  const handleJoinGroupCall = (data: {
    groupId: string;
    userId: string;
    callType: "audio" | "video";
    callId: string;
  }) => {
    if (data.groupId === groupId && !isModalOpen && data.userId !== userId) {
      console.log(
        `Incoming group call from ${data.userId}, callId: ${data.callId}`
      );
      setIncomingCallData({
        groupId: data.groupId,
        initiatorId: data.userId,
        callType: data.callType,
        callId: data.callId,
      });
      setInitiatorId(data.userId);
      initiatorIdRef.current = data.userId;
      callIdRef.current = data.callId;
      callTypeRef.current = data.callType;
      setIsIncomingCall(true);
      toast(`Incoming group ${data.callType} call`, { duration: 30000 });
    }
  };

  const handleGroupCallEnded = (data: GroupCallData) => {
    if (data.groupId === groupId && data.callId === callIdRef.current) {
      console.log(
        `Group call ended for group ${data.groupId}, callId: ${data.callId}`
      );
      setIsModalOpen(false);
      setIsIncomingCall(false);
      cleanupLocalStream();
      webRTCServiceRef.current.stop();
      setCurrentCallType(null);
      setCallId(null);
      callIdRef.current = null;
      callTypeRef.current = null;
      initiatorIdRef.current = null;
      setJoinedMembers([]);
      setInitiatorId(null);
      setIncomingCallData(null);
      // pendingUserJoins.current = [];
      pendingOffers.current = [];
      isStreamReady.current = false;
      toast.success("Group call ended");
    }
  };

  const acceptGroupCall = async () => {
    if (!incomingCallData) return;
    try {
      console.log(
        `Accepting group call from ${incomingCallData.initiatorId}, callId: ${incomingCallData.callId}`
      );
      setCallId(incomingCallData.callId);
      callIdRef.current = incomingCallData.callId;
      setCurrentCallType(incomingCallData.callType);
      callTypeRef.current = incomingCallData.callType;
      setInitiatorId(incomingCallData.initiatorId);
      initiatorIdRef.current = incomingCallData.initiatorId;
      await initializeStream();
      if (!localStream.current) {
        throw new Error("Failed to acquire local stream");
      }
      setIsModalOpen(true);
      socketService.emitJoinGroupCall(
        groupId,
        userId,
        incomingCallData.callType,
        incomingCallData.callId
      );
      setHasJoinedCall(incomingCallData.callType);
      setIsIncomingCall(false);
      toast.success("Joined group call");
    } catch (error) {
      console.error("Error accepting group call:", error);
      toast.error("Failed to join group call.");
      setIsIncomingCall(false);
      setIncomingCallData(null);
      setInitiatorId(null);
      callIdRef.current = null;
      callTypeRef.current = null;
      initiatorIdRef.current = null;
      pendingOffers.current = [];
      isStreamReady.current = false;
    }
  };

  const declineGroupCall = () => {
    if (!incomingCallData) return;
    console.log(`Declining group call from ${incomingCallData.initiatorId}`);
    setIsIncomingCall(false);
    setIncomingCallData(null);
    setInitiatorId(null);
    callIdRef.current = null;
    callTypeRef.current = null;
    initiatorIdRef.current = null;
    // pendingUserJoins.current = [];
    pendingOffers.current = [];
    isStreamReady.current = false;
    toast.error("Group call declined");
  };

  const setupSocketListeners = () => {
    socketService.onUserRoomJoined(handleUserRoomJoined);
    socketService.onUserRoomLeft(handleUserRoomLeft);
    socketService.onJoinGroupCall(handleJoinGroupCall);
    socketService.onGroupCallEnded(handleGroupCallEnded);
    socketService.onGroupOffer(handleGroupOffer);
    socketService.onGroupAnswer(handleGroupAnswer);
    socketService.onGroupIceCandidate(handleGroupIceCandidate);
    socketService.onJoinedGroupCall(handleJoinedGroupCall);
    return () => {
      socketService.offUserRoomJoined(handleUserRoomJoined);
      socketService.offUserRoomLeft(handleUserRoomLeft);
      socketService.offJoinGroupCall(handleJoinGroupCall);
      socketService.offGroupCallEnded(handleGroupCallEnded);
      socketService.offGroupOffer(handleGroupOffer);
      socketService.offGroupAnswer(handleGroupAnswer);
      socketService.offGroupIceCandidate(handleGroupIceCandidate);
      socketService.offJoinedGroupCall(handleJoinedGroupCall);
    };
  };

  const cleanupLocalStream = () => {
    if (localStream.current) {
      console.log("Cleaning up local stream");
      localStream.current.getTracks().forEach((track) => {
        track.stop();
        console.log(
          `Stopped track: ${track.kind}, id: ${track.id}, readyState: ${track.readyState}`
        );
      });
      localStream.current = null;
    }
    remoteStreams.current.clear();
    isStreamReady.current = false;
  };

  const emitGroupCallEnded = () => {
    if (callId && currentCallType) {
      console.log(`Emitting groupCallEnded for callId: ${callId}`);
      const callData: GroupCallData = {
        groupId,
        type: "group",
        callId,
        callType: currentCallType,
      };
      if (userId !== initiatorId) {
        callData.senderId = userId;
      }
      socketService.emitGroupCallEnded(callData);
    }
  };

  useEffect(() => {
    if (
      isModalOpen &&
      localStream.current &&
      localVideoRef.current &&
      currentCallType === "video"
    ) {
      playLocalStream();
    } else {
      clearVideoStream();
    }
  }, [isModalOpen, currentCallType]);

  useEffect(() => {
    return setupSocketListeners();
  }, [groupId, userId]);

  useEffect(() => {
    const currentWebRTCServiceRef = webRTCServiceRef.current;
    return () => {
      cleanupLocalStream();
      currentWebRTCServiceRef.stop();
    };
  }, []);

  useEffect(() => {
    let timeout: number;
    if (isIncomingCall && incomingCallData) {
      timeout = setTimeout(() => {
        console.log(
          `Auto-declining group call from ${incomingCallData.initiatorId}`
        );
        declineGroupCall();
      }, 30000);
      if (userId !== incomingCallData.initiatorId) {
        setTimeout(() => {
          if (!isModalOpen && pendingOffers.current.length > 0) {
            console.log(
              `Clearing stale pending offers: ${pendingOffers.current.map(
                (o) => o.senderId
              )}`
            );
            pendingOffers.current = [];
          }
        }, 30000);
      }
    }
    return () => clearTimeout(timeout);
  }, [isIncomingCall, incomingCallData]);

  useEffect(() => {
    const currentWebRTCServiceRef = webRTCServiceRef.current;
    webRTCServiceRef.current.onNegotiationNeeded = (
      targetId: string,
      offer: RTCSessionDescriptionInit
    ) => {
      if (
        !callIdRef.current ||
        !callTypeRef.current ||
        !isStreamReady.current
      ) {
        console.log(
          `Queuing offer for ${targetId} due to missing callId, callType, or stream`
        );
        pendingOffers.current.push({
          groupId,
          type: "group",
          callId: callIdRef.current || "",
          callType: callTypeRef.current || "video",
          senderId: userId,
          recipientId: targetId,
          offer,
        });
        return;
      }
      console.log(
        `Sending offer from onnegotiationneeded to ${targetId}, callId: ${callIdRef.current}`
      );
      socketService.sendGroupOffer({
        groupId,
        type: "group",
        callId: callIdRef.current,
        callType: callTypeRef.current,
        senderId: userId,
        recipientId: targetId,
        offer,
      });
    };
    return () => {
      currentWebRTCServiceRef.onNegotiationNeeded = undefined;
    };
  }, [groupId, userId]);

  useEffect(() => {
    joinedMembers.forEach((memberId) => {
      if (memberId !== userId) {
        const remoteVideo = remoteVideoRefs.current.get(memberId);
        const stream = remoteStreams.current.get(memberId);
        if (remoteVideo && stream && remoteVideo.srcObject !== stream) {
          console.log(
            `Re-attaching stream for ${memberId}, stream: ${stream.id}`
          );
          remoteVideo.srcObject = stream;
          remoteVideo.play().catch((err) => {
            console.error(
              `Error re-playing remote video for ${memberId}:`,
              err
            );
            toast.error(`Failed to render video for ${memberId}`);
          });
        }
      }
    });
  }, [joinedMembers]);

  React.useImperativeHandle(
    ref as RefObject<{ startGroupCall: (type: "audio" | "video") => void }>,
    () => ({
      startGroupCall: async (type: "audio" | "video") => {
        try {
          console.log(
            `Starting group ${type} call for group: ${groupId}, user: ${userId}`
          );
          const newCallId = uuidv4();
          setCallId(newCallId);
          callIdRef.current = newCallId;
          setCurrentCallType(type);
          callTypeRef.current = type;
          setInitiatorId(userId);
          initiatorIdRef.current = userId;
          await initializeStream();
          setIsModalOpen(true);
          setJoinedMembers([userId]);
          socketService.emitJoinGroupCall(groupId, userId, type, newCallId);
          toast.success("Group call initiated");
        } catch (error) {
          console.error("Error starting group call:", error);
          toast.error("Failed to start group call.");
          setIsModalOpen(false);
          isStreamReady.current = false;
        }
      },
    })
  );

  const handleClose = () => {
    setIsModalOpen(false);
    cleanupLocalStream();
    webRTCServiceRef.current.stop();
    emitGroupCallEnded();
    setCurrentCallType(null);
    setCallId(null);
    callIdRef.current = null;
    callTypeRef.current = null;
    initiatorIdRef.current = null;
    setJoinedMembers([]);
    setInitiatorId(null);
    setIncomingCallData(null);
    // pendingUserJoins.current = [];
    pendingOffers.current = [];
    isStreamReady.current = false;
    toast.success(
      userId === initiatorId ? "Group call ended" : "You left the group call"
    );
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleClose} className="z-[50]">
        <ModalContent>
          <ModalHeader>
            Group {currentCallType === "video" ? "Video" : "Audio"} Call
          </ModalHeader>
          <ModalBody>
            {currentCallType === "video" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative w-full h-48 sm:h-64 bg-gray-900 rounded-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ backgroundColor: "black" }}
                    onError={(e) => {
                      console.error("Video element error:", e);
                      toast.error("Failed to render local video.");
                    }}
                    onLoadedMetadata={() =>
                      console.log("Video metadata loaded")
                    }
                    onCanPlay={() => console.log("Video can play")}
                  />
                  <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                    You
                  </p>
                </div>
                {joinedMembers
                  .filter((memberId) => memberId !== userId)
                  .map((memberId) => (
                    <div
                      key={memberId}
                      className="relative w-full h-48 sm:h-64 bg-gray-900 rounded-lg"
                    >
                      <video
                        ref={(el) => {
                          if (el) {
                            remoteVideoRefs.current.set(memberId, el);
                            const stream = remoteStreams.current.get(memberId);
                            if (stream && el.srcObject !== stream) {
                              console.log(
                                `Attaching stored stream to video element for ${memberId}, stream: ${stream.id}`
                              );
                              el.srcObject = stream;
                              const attemptPlay = (
                                attempts = 3,
                                delay = 500
                              ) => {
                                el.play()
                                  .then(() => {
                                    console.log(
                                      `Remote video playing for ${memberId}`
                                    );
                                  })
                                  .catch((err) => {
                                    console.error(
                                      `Error playing remote video for ${memberId}:`,
                                      err
                                    );
                                    if (attempts > 0) {
                                      console.log(
                                        `Retrying play for ${memberId}, attempts left: ${attempts}`
                                      );
                                      setTimeout(
                                        () => attemptPlay(attempts - 1, delay),
                                        delay
                                      );
                                    } else {
                                      toast.error(
                                        `Failed to render video for ${memberId}`
                                      );
                                    }
                                  });
                              };
                              attemptPlay();
                            }
                          } else {
                            remoteVideoRefs.current.delete(memberId);
                          }
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        style={{
                          backgroundColor: "black",
                          border: "2px solid red",
                        }}
                        onError={(e) => {
                          console.error(
                            `Video element error for ${memberId}:`,
                            e
                          );
                          toast.error(`Failed to render video for ${memberId}`);
                        }}
                        onLoadedMetadata={() =>
                          console.log(
                            `Remote video metadata loaded for ${memberId}`
                          )
                        }
                        onCanPlay={() =>
                          console.log(`Remote video can play for ${memberId}`)
                        }
                      />
                      <p className="absolute bottom-2 left-2 text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded">
                        {memberId}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="relative w-full h-48 sm:h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white text-lg">Audio Call - No Video</p>
              </div>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Joined members: {joinedMembers.length}
              </p>
              <ul className="text-sm text-gray-400">
                {joinedMembers.map((memberId) => (
                  <li key={memberId}>
                    {memberId === userId ? "You" : memberId}
                  </li>
                ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={handleClose}>
              End Call
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isIncomingCall}
        onClose={declineGroupCall}
        className="z-[50]"
      >
        <ModalContent>
          <ModalHeader>
            Incoming Group{" "}
            {incomingCallData?.callType === "video" ? "Video" : "Audio"} Call
          </ModalHeader>
          <ModalBody>
            <p>Call from group {groupId}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={declineGroupCall}>
              Decline
            </Button>
            <Button color="primary" onPress={acceptGroupCall}>
              Accept
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

GroupCall.displayName = "GroupCall";

export default GroupCall;
