import { Card, CardBody, Chip, Avatar } from "@nextui-org/react";
import { FaUsers, FaCalendarAlt, FaDollarSign, FaClock } from "react-icons/fa";
import { Group, GroupRequests } from "../../../../../redux/types";
import { Slot } from "../../../../../validation/createGroupValidation";

type Props = {
  group: Group;
  isAdmin: boolean;
  pendingRequests: GroupRequests[];
  availableSlots: Slot[];
};

export const GroupInfoGrid = ({ group, isAdmin, pendingRequests, availableSlots }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Admin Card */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Admin</h3>
          <div className="flex items-center gap-3">
            <Avatar src={group.admin?.profilePic} size="md" />
            <div>
              <p className="font-medium">{group.admin?.name || "Admin"}</p>
              <p className="text-sm text-default-500">{group.admin?.jobTitle || ""}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Group Info */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Group Info</h3>
          <div className="space-y-3 text-default-500">
            <div className="flex items-center gap-2">
              <FaUsers /> <span>{group.members?.length || 0} / 4 members</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt /> <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            {group.price > 0 && (
              <div className="flex items-center gap-2">
                <FaDollarSign /> <span>₹{group.price}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Requests or Slots */}
      {isAdmin ? (
        <Card>
          <CardBody>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              Join Requests
              {pendingRequests.length > 0 && (
                <Chip size="sm" color="danger" variant="solid">{pendingRequests.length}</Chip>
              )}
            </h3>
            {pendingRequests.length === 0 ? (
              <p className="text-default-500">No pending requests</p>
            ) : (
              <div className="space-y-2">
                {pendingRequests.slice(0, 2).map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-sm">
                    <span>{req.user.name}</span>
                    <Chip size="sm" color="warning" variant="flat">Pending</Chip>
                  </div>
                ))}
                {pendingRequests.length > 2 && (
                  <p className="text-xs text-default-500 text-center">+{pendingRequests.length - 2} more</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <h3 className="font-semibold mb-4">Available Slots</h3>
            {availableSlots.length > 0 ? (
              <div className="space-y-3">
                {availableSlots.map((slot, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 font-medium">
                      <FaClock /> {slot.day}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {slot.timeSlots?.map((t: string, j: number) => (
                        <Chip key={j} size="sm" variant="flat">{t}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-default-500">No slots</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};