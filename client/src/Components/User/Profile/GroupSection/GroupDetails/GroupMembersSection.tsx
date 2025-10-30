import { Card, CardBody, Avatar, Button } from "@nextui-org/react";
import { GroupMemberDetail } from "../../../../../redux/types";

type Props = {
  members: GroupMemberDetail[];
  isAdmin: boolean;
  onRemove: (userId: string) => void;
};

export const GroupMembersSection = ({ members, isAdmin, onRemove }: Props) => {
  if (members.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Members</h2>
        <Card><CardBody><p className="text-center text-default-500">No members yet</p></CardBody></Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <Card key={m.user.id} className="p-4">
            <CardBody className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={m.user.profilePic} size="md" />
                  <div>
                    <p className="font-medium">{m.user.name}</p>
                    <p className="text-sm text-default-500">{m.user.jobTitle || ""}</p>
                    <p className="text-xs text-default-400">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <Button color="danger" variant="light" size="sm" onClick={() => onRemove(m.user.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};