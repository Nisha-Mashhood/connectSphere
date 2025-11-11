import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDisclosure } from "@nextui-org/react";
import ConnectionHeader from "./ConnectionHeader";
import ConnectionStatus from "./ConnectionStatus";
import ConnectionTimeline from "./ConnectionTimeline";
import UserProfileCard from "./UserProfileCard";
import DisconnectModal from "./DisconnectModal";
import { UserConnection } from "../../../../redux/types";
import { disconnectUser_UserConnection, User_UserConnectionsById } from "../../../../Service/User-User.Service";

const UserUserCollabDetails = () => {
  const { connId } = useParams<{ connId: string }>();
  const [connection, setConnection] = useState<UserConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectReason, setDisconnectReason] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const getConnectionDetails = async () => {
      setIsLoading(true);
      try {
        const data = await User_UserConnectionsById(connId as string);
        setConnection(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getConnectionDetails();
  }, [connId]);

  const handleDisconnect = async () => {
    try {
      await disconnectUser_UserConnection(connId, disconnectReason);
      toast.success("Connection disconnected successfully");
      navigate("/admin/userUserMangemnt");
      onClose();
      setDisconnectReason("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to disconnect");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!connection)
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Connection Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The requested collaboration details could not be found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ConnectionHeader connection={connection} navigate={navigate} />
        <ConnectionStatus
          connection={connection}
          onDisconnect={onOpen}
        />
        <div className="p-6">
          <ConnectionTimeline connection={connection} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserProfileCard user={connection.requester} role="Requester" />
            <UserProfileCard user={connection.recipient} role="Recipient" />
          </div>
        </div>
      </div>

      <DisconnectModal
        isOpen={isOpen}
        onClose={onClose}
        reason={disconnectReason}
        setReason={setDisconnectReason}
        onConfirm={handleDisconnect}
      />
    </div>
  );
};

export default UserUserCollabDetails;