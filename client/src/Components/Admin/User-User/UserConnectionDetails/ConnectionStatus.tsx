import { Button } from "@nextui-org/react";
import { UserConnection } from "../../../../redux/types";

interface Props {
  connection: UserConnection;
  onDisconnect: () => void;
}

const ConnectionStatus: React.FC<Props> = ({ connection, onDisconnect }) => {
  const getStatusColor = (status: string) =>
    status === "Connected" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="p-4 bg-gray-50 flex items-center justify-between">
      <div className="text-sm">
        <span className="text-gray-600">Connection Status: </span>
        <div className="inline-flex items-center">
          <span
            className={`h-3 w-3 rounded-full ${getStatusColor(
              connection.connectionStatus
            )} mr-2`}
          ></span>
          <span className="font-medium">{connection.connectionStatus}</span>
        </div>
      </div>

      {connection.connectionStatus === "Connected" && (
        <Button color="danger" variant="flat" onPress={onDisconnect}>
          Disconnect
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
