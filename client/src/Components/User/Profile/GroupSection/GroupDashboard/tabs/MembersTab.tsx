import {
  Card,
  CardBody,
  User,
  Chip,
  Button,
} from "@nextui-org/react";
import { Group } from "../../../../../../redux/types";

type Props = {
  group: Group;
  isAdmin: boolean;
  onRemoveUser: (userId: string) => void;
};

export const MembersTab = ({ group, isAdmin, onRemoveUser }: Props) => {
  const admin = group.admin;

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Group Members</h3>

      {/* Admin */}
      <div className="mb-6">
        <Card className="bg-primary-50 border-primary">
          <CardBody>
            {admin ? (
              <User
                name={`${admin.name || "Unknown"} (Admin)`}
                description={admin.jobTitle || "No job title"}
                avatarProps={{
                  src: admin.profilePic || "/api/placeholder/100/100",
                  className: "border-2 border-primary",
                }}
              />
            ) : (
              <p className="text-center">Admin information unavailable</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Other Members */}
      {group.membersDetails?.length ? (
        <div className="space-y-4">
          {group.membersDetails
            .filter((m) => m.user.id !== group.adminId)
            .map((m) => (
              <Card key={m.user.id} className="border border-default-200">
                <CardBody>
                  <div className="flex justify-between items-center">
                    <User
                      name={m.user.name || "Unknown"}
                      description={m.user.jobTitle || "No job title"}
                      avatarProps={{
                        src: m.user.profilePic || "/api/placeholder/100/100",
                      }}
                    />
                    <div className="flex items-center gap-4">
                      <Chip variant="flat" size="sm">
                        Joined {new Date(m.joinedAt).toLocaleDateString()}
                      </Chip>
                      {isAdmin && (
                        <Button
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => onRemoveUser(m.user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <p className="text-center text-default-500">No members yet</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};