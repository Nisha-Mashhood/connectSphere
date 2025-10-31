import { useState, useEffect, useCallback } from "react";
import {
  getUser_UserRequests,
  getUser_UserConnections,
  respondToUser_UserRequest,
  disconnectUser_UserConnection,
} from "../../Service/User-User.Service";
import toast from "react-hot-toast";

import {
  User,
  UserConnection,
  UserUserRequestsResponse,
} from "../../redux/types";

interface UseUserConnectionsProps {
  currentUserId: string;
  currentUserName?: string;
  currentUserEmail?: string;
}

interface UseUserConnectionsReturn {
  connections: UserConnection[];
  requests: UserConnection[];
  loading: boolean;
  refetch: () => Promise<void>;

  // Actions
  handleRequestResponse: (requestId: string, action: "Accepted" | "Rejected") => Promise<void>;
  handleDisconnect: (connection: UserConnection, reason: string) => Promise<void>;

  // Helpers
  getOtherUser: (item: UserConnection) => User;
  getOtherUserId: (item: UserConnection) => string;
  getRequestDisplayText: (req: UserConnection) => string;
  isReceiver: (req: UserConnection) => boolean;

  // Disconnect modal state
  selectedConnection: UserConnection | null;
  setSelectedConnection: (conn: UserConnection | null) => void;
  disconnectReason: string;
  setDisconnectReason: (reason: string) => void;
}

export const useUserConnections = ({
  currentUserId,
  currentUserName = "You",
  currentUserEmail = "",
}: UseUserConnectionsProps): UseUserConnectionsReturn => {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [requests, setRequests] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<UserConnection | null>(null);
  const [disconnectReason, setDisconnectReason] = useState("");

  const fetchUserData = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const [connectionsData, requestsData]: [
        UserConnection[],
        UserUserRequestsResponse
      ] = await Promise.all([
        getUser_UserConnections(currentUserId),
        getUser_UserRequests(currentUserId),
      ]);

      // Active connections
      setConnections(connectionsData ?? []);

      const received = requestsData.receivedRequests ?? [];
      const sent = requestsData.sentRequests ?? [];

      const mergedRequests: UserConnection[] = [
        ...received.map((r) => ({
          ...r,
          recipient: {
            id: currentUserId,
            name: currentUserName,
            email: currentUserEmail,
          } as User,
        })),
        ...sent.map((r) => ({
          ...r,
          recipient: r.recipient ?? ({} as User),
        })),
      ];

      setRequests(mergedRequests);
    } catch (err) {
      console.error("Failed to fetch connections/requests:", err);
      toast.error("Failed to load connections / requests");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserName, currentUserEmail]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleRequestResponse = async (requestId: string, action: "Accepted" | "Rejected") => {
    try {
      await respondToUser_UserRequest(requestId, action);
      toast.success(`Request ${action.toLowerCase()}!`);
      await fetchUserData();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action.toLowerCase()} request`);
    }
  };

  const handleDisconnect = async (connection: UserConnection, reason: string) => {
    try {
      await disconnectUser_UserConnection(connection.id, reason);
      toast.success("Disconnected successfully");
      await fetchUserData();
      setSelectedConnection(null);
      setDisconnectReason("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect");
    }
  };

  const getOtherUser = (item: UserConnection): User => {
    return currentUserId === item.requesterId
      ? item.recipient ?? item.requester
      : item.requester;
  };

  const getOtherUserId = (item: UserConnection): string => {
    return currentUserId === item.requesterId ? item.recipientId : item.requesterId;
  };

  const isReceiver = (req: UserConnection): boolean => {
    return currentUserId === req.recipientId;
  };

  const getRequestDisplayText = (req: UserConnection): string => {
    const other = getOtherUser(req);
    return isReceiver(req)
      ? `${other.name} wants to connect`
      : `You sent a request to ${other.name}`;
  };

  return {
    connections,
    requests,
    loading,
    refetch: fetchUserData,

    handleRequestResponse,
    handleDisconnect,

    getOtherUser,
    getOtherUserId,
    isReceiver,
    getRequestDisplayText,

    selectedConnection,
    setSelectedConnection,
    disconnectReason,
    setDisconnectReason,
  };
};