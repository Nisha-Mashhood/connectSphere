import { Card, CardBody, Button, User, Chip } from "@nextui-org/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Group, GroupRequests } from "../../../../../redux/types";

type Props = {
  requests: GroupRequests[];
  group: Group;
  onUpdate: (id: string, status: "Accepted" | "Rejected") => void;
};

export const GroupRequestsSection = ({ requests, group, onUpdate }: Props) => {
  if (requests.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Join Requests</h2>
      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id}>
            <CardBody>
              <div className="flex justify-between items-center gap-4">
                <User
                  name={req.user.name}
                  description={req.user.email}
                  avatarProps={{ src: req.user.profilePic }}
                />
                <div className="flex gap-2">
                  {req.status === "Pending" ? (
                    <>
                      <Button
                        color="success"
                        size="sm"
                        variant="flat"
                        startContent={<FaCheck />}
                        onClick={() => onUpdate(req.id, "Accepted")}
                        isDisabled={group.isFull}
                      >
                        Accept
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        startContent={<FaTimes />}
                        onClick={() => onUpdate(req.id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Chip color={req.status === "Accepted" ? "success" : "danger"}>
                      {req.status}
                    </Chip>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};