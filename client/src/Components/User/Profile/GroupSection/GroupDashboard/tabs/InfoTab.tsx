import { Card, CardBody, Chip, Divider } from "@nextui-org/react";
import { FaUsers, FaCalendar, FaInfoCircle, FaTag } from "react-icons/fa";
import { Group } from "../../../../../../redux/types";

type Props = {
  group: Group;
};

export const InfoTab = ({ group }: Props) => {
  const memberCount = group.members?.length || 0;
  const isFull = group.isFull || memberCount >= (group.maxMembers || 4);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaInfoCircle className="text-primary" />
        Group Information
      </h3>

      <Card className="border border-default-200 shadow-sm">
        <CardBody className="space-y-6">
          {/* Group Name */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FaTag className="text-primary text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-default-500">Group Name</p>
              <p className="text-lg font-semibold text-foreground">{group.name}</p>
            </div>
          </div>

          <Divider className="bg-default-200" />

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-default-500">Description</p>
              <p className="text-foreground leading-relaxed">
                {group.bio || (
                  <span className="italic text-default-400">
                    No description provided
                  </span>
                )}
              </p>
            </div>
          </div>

          <Divider className="bg-default-200" />

          {/* Created Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaCalendar className="text-green-600 dark:text-green-400 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-default-500">Created On</p>
              <p className="text-foreground font-medium">
                {group.createdAt
                  ? new Date(group.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>

          <Divider className="bg-default-200" />

          {/* Members */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaUsers className="text-purple-600 dark:text-purple-400 text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-default-500">Members</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-foreground">
                  {memberCount}
                </span>
                <span className="text-default-500">of</span>
                <span className="text-lg font-bold text-foreground">
                  {group.maxMembers || 4}
                </span>
                <Chip
                  size="sm"
                  color={isFull ? "danger" : "success"}
                  variant="flat"
                  className="ml-2"
                >
                  {isFull ? "Full" : "Open"}
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {group.price !== undefined && (
        <Card className="mt-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <CardBody className="py-3 text-center">
            <p className="text-sm text-default-500">Entry Fee</p>
            <p className="text-xl font-bold text-primary">
              ₹{group.price}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};