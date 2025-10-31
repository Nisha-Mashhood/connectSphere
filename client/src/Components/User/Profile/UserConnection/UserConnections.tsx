import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { FaUserFriends, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { getRelativeTime } from "../../../../pages/User/Profile/helper";
import { useUserConnections } from "../../../../Hooks/User/useUserConnection";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import BaseModal from "../../../ReusableComponents/BaseModal";

interface Props {
  handleProfileClick: (userId: string) => void;
}

const UserConnections = ({ handleProfileClick }: Props) => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    connections,
    requests,
    loading,
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
  } = useUserConnections({
    currentUserId: currentUser.id,
    currentUserName: currentUser.name ?? "You",
    currentUserEmail: currentUser.email ?? "",
  });

  if (loading) {
    return <p className="text-center text-gray-500">Loading connections...</p>;
  }

  return (
    <>
      {/* === Connection Requests === */}
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
              .filter((r) => r.requestStatus === "Pending")
              .map((req) => {
                const other = getOtherUser(req);
                return (
                  <div key={req.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar src={other.profilePic} className="w-12 h-12" />
                        <div>
                          <p
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() =>
                              handleProfileClick(getOtherUserId(req))
                            }
                          >
                            {getRequestDisplayText(req)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getRelativeTime(req.createdAt)}
                          </p>
                        </div>
                      </div>

                      {isReceiver(req) && req.requestStatus === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="success"
                            variant="flat"
                            onPress={() =>
                              handleRequestResponse(req.id, "Accepted")
                            }
                          >
                            <FaCheckCircle />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="flat"
                            onPress={() =>
                              handleRequestResponse(req.id, "Rejected")
                            }
                          >
                            <FaTimesCircle />
                          </Button>
                        </div>
                      )}

                      {req.requestStatus !== "Pending" && (
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            req.requestStatus === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.requestStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            {requests.filter((r) => r.requestStatus === "Pending").length ===
              0 && (
              <p className="text-center text-gray-500">No pending requests</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* === Active Connections === */}
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
                (c) =>
                  c.requestStatus === "Accepted" &&
                  c.connectionStatus === "Connected"
              )
              .map((conn) => {
                const other = getOtherUser(conn);
                return (
                  <div key={conn.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar src={other.profilePic} className="w-12 h-12" />
                        <div>
                          <p
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() =>
                              handleProfileClick(getOtherUserId(conn))
                            }
                          >
                            {other.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Connected {getRelativeTime(conn.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        color="danger"
                        variant="flat"
                        onPress={() => {
                          setSelectedConnection(conn);
                          onOpen();
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                );
              })}

            {connections.filter(
              (c) =>
                c.requestStatus === "Accepted" &&
                c.connectionStatus === "Connected"
            ).length === 0 && (
              <p className="text-center text-gray-500">No active connections</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* === Disconnect Modal === */}
      <BaseModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setDisconnectReason("");
        }}
        title="Disconnect Connection"
        actionText="Disconnect"
        cancelText="Cancel"
        onSubmit={async () => {
          if (selectedConnection) {
            await handleDisconnect(selectedConnection, disconnectReason);
          }
        }}
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to disconnect with{" "}
            <span className="font-semibold">
              {selectedConnection ? getOtherUser(selectedConnection).name : ""}
            </span>
            ?
          </p>
          <Textarea
            label="Reason (optional)"
            placeholder="Why are you disconnecting?"
            value={disconnectReason}
            onChange={(e) => setDisconnectReason(e.target.value)}
          />
        </div>
      </BaseModal>
    </>
  );
};

export default UserConnections;
