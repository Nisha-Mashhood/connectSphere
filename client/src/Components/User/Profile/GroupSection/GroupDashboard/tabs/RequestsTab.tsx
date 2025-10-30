import {
  Card,
  CardBody,
  Button,
  User,
  Chip,
} from "@nextui-org/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { GroupRequests as GroupReq, Group } from "../../../../../../redux/types";

type Props = {
  requests: GroupReq[];
  group: Group;
  onUpdate: (id: string, status: "Accepted" | "Rejected") => void;
  isProcessing: Record<string, boolean>;
};

export const RequestsTab = ({
  requests,
  group,
  onUpdate,
  isProcessing,
}: Props) => {
  if (requests.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-default-500">No pending requests</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {requests.map((req) => (
        <Card
          key={req.id}
          className={`border ${
            req.status === "Pending"
              ? "border-warning"
              : req.status === "Accepted"
              ? "border-success"
              : "border-danger"
          }`}
        >
          <CardBody>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <User
                name={req.user.name}
                description={req.user.email}
                avatarProps={{
                  src: req.user.profilePic || "/api/placeholder/100/100",
                }}
              />

              <div className="flex flex-wrap gap-2">
                {group.isFull && req.status === "Pending" ? (
                  <Chip color="danger" variant="flat">
                    Group is full (max 4 members)
                  </Chip>
                ) : req.status === "Pending" ? (
                  <>
                    <Button
                      color="success"
                      variant="flat"
                      size="sm"
                      startContent={<FaCheck />}
                      onPress={() => onUpdate(req.id, "Accepted")}
                      isDisabled={group.isFull || isProcessing[req.id]}
                      isLoading={isProcessing[req.id]}
                    >
                      Accept
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      startContent={<FaTimes />}
                      onPress={() => onUpdate(req.id, "Rejected")}
                      isDisabled={isProcessing[req.id]}
                      isLoading={isProcessing[req.id]}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Chip
                    color={req.status === "Accepted" ? "success" : "danger"}
                    variant="flat"
                  >
                    {req.status}
                  </Chip>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};