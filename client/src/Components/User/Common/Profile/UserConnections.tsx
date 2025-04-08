import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import { FaUserFriends, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import {
  getUser_UserRequests,
  getUser_UserConnections,
  respondToUser_UserRequest,
  disconnectUser_UserConnection,
} from "../../../../Service/User-User.Service";
import { getRelativeTime } from "../../../../lib/helperforprofile";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserConnections = ({ currentUser, handleProfileClick }) => {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [disconnectReason, setDisconnectReason] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Fetch both connections and requests
  const fetchUserData = async () => {
    try {
      const connectionsData = await getUser_UserConnections(currentUser._id);
      const requestsData = await getUser_UserRequests(currentUser._id);

      console.log("connectionData :", connectionsData);
      console.log("requsetsdata : ", requestsData);

      setConnections(connectionsData.data || []);

      // Combine sent and received requests
      const allRequests = [
        ...(requestsData.sentRequests || []),
        ...(requestsData.receivedRequests || []),
      ];
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user connections");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser._id]);

  // Handle request responses
  const handleRequestResponse = async (requestId, action) => {
    try {
      const response = await respondToUser_UserRequest(requestId, action);
      if (response) {
        toast.success(`Request ${action} successfully`);
        fetchUserData();
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${action} request`);
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      await disconnectUser_UserConnection(
        selectedConnection._id,
        disconnectReason
      );
      toast.success("Connection disconnected successfully");
      fetchUserData();
      onClose();
      setSelectedConnection(null);
      setDisconnectReason("");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };
  console.log(currentUser._id);

  return (
    <>
      {/* Pending Requests Section */}
      <Card className="mb-6">
        <CardHeader className="bg-primary-50">
          <div className="flex items-center gap-2">
            <FaUserFriends className="text-xl text-primary" />
            <h2 className="text-xl font-bold">Connection Requests</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {requests
              .filter(
                (request) =>
                  request.requestStatus === "Pending" ||
                  request.requestStatus === "Rejected"
              )
              .map((request) => (
                <div key={request._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={
                          currentUser._id === request.requester
                            ? request.recipient?.profilePic
                            : request.requester?.profilePic
                        }
                        className="w-12 h-12"
                      />
                      <div>
                        <p
                          className="font-semibold cursor-pointer hover:underline"
                          onClick={() =>
                            handleProfileClick(
                              currentUser._id === request.requester
                                ? request.recipient?._id
                                : request.requester?._id
                            )
                          }
                        >
                          {currentUser._id === request.requester
                            ? `Request sent to ${request.recipient?.name}`
                            : `Request from ${request.requester?.name}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getRelativeTime(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {currentUser._id === request.recipient &&
                      request.requestStatus === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="success"
                            variant="flat"
                            onPress={() =>
                              handleRequestResponse(request._id, "Accepted")
                            }
                          >
                            <FaCheckCircle />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="flat"
                            onPress={() =>
                              handleRequestResponse(request._id, "Rejected")
                            }
                          >
                            <FaTimesCircle />
                          </Button>
                        </div>
                      )}

                    {request.requestStatus !== "Pending" && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          request.requestStatus === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.requestStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            {requests.filter(
              (request) =>
                request.requestStatus === "Pending" ||
                request.requestStatus === "Rejected"
            ).length === 0 && (
              <p className="text-center text-gray-500">No pending requests</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Active Connections Section */}
      <Card>
        <CardHeader className="bg-primary-50">
          <div className="flex items-center gap-2">
            <FaUserFriends className="text-xl text-primary" />
            <h2 className="text-xl font-bold">Active Connections</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {connections
              .filter(
                (conn) =>
                  conn.requestStatus === "Accepted" &&
                  conn.connectionStatus === "Connected"
              )
              .map((connection) => (
                <div key={connection._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={
                          currentUser._id === connection.requester?._id
                            ? connection.recipient?.profilePic
                            : connection.requester?.profilePic
                        }
                        className="w-12 h-12"
                      />
                      <div>
                        <p
                          className="font-semibold cursor-pointer hover:underline"
                          onClick={() =>
                            handleProfileClick(
                              currentUser._id === connection.requester?._id
                                ? connection.recipient?._id
                                : connection.requester?._id
                            )
                          }
                        >
                          Connected with{" "}
                          {currentUser._id === connection.requester?._id
                            ? connection.recipient?.name
                            : connection.requester?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Connected since{" "}
                          {getRelativeTime(connection.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        setSelectedConnection(connection);
                        onOpen();
                      }}
                    >
                      Disconnect
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => navigate(`/chat/user-user/${connection._id}`)}
                    >
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            {connections.filter(
              (conn) =>
                conn.requestStatus === "Accepted" &&
                conn.connectionStatus === "Connected"
            ).length === 0 && (
              <p className="text-center text-gray-500">No active connections</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Disconnect Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Disconnect Connection</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to disconnect with{" "}
                  {currentUser._id === selectedConnection?.requester
                    ? selectedConnection?.recipient?.name
                    : selectedConnection?.requester?.name}
                  ?
                </p>
                <Textarea
                  label="Reason for disconnecting"
                  placeholder="Please provide a reason"
                  value={disconnectReason}
                  onChange={(e) => setDisconnectReason(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDisconnect}>
                  Disconnect
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserConnections;
