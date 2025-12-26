import React from "react";
import GroupCallOverlay from "../GroupCallOverlay";

interface GroupCallProps {
  groupId: string;
  userId: string;
  isActive: boolean;
  onEnd: () => void;
}

const GroupCall: React.FC<GroupCallProps> = ({
  groupId,
  userId,
  isActive,
  onEnd,
}) => {
  const roomName = `group-${groupId}`;
  const userName = `User-${userId.slice(-6)}`;

  return (
    <>
      {isActive && (
        <GroupCallOverlay
          roomName={roomName}
          userName={userName}
          onClose={onEnd}
        />
      )}
    </>
  );
};

export default GroupCall;