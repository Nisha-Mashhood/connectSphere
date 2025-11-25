import { Avatar } from "@nextui-org/react";
import {
    formatCallDuration, 
    formatCallTime, 
    getCallParticipantName, 
    getCallStatusIcon, 
    getCallTypeIcon 
} from "../utils/chatSidebarUtils";


const CallLogItem = ({ callLog, currentUserId }) => {
  return (
    <div className="flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
      <Avatar size="sm" />

      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <p className="font-medium">{getCallParticipantName(callLog, currentUserId)}</p>
          {getCallStatusIcon(callLog, currentUserId)}
        </div>

        <p className="text-xs text-gray-500">
          {formatCallDuration(callLog)} • {formatCallTime(callLog.startTime)}
        </p>
      </div>

      {getCallTypeIcon(callLog.callType)}
    </div>
  );
};

export default CallLogItem;
