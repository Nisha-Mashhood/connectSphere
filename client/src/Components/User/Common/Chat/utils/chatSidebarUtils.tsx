import { format, parseISO } from "date-fns";
import { IChatMessage } from "../../../../../Interface/User/IchatMessage";
import { 
  FaGraduationCap, 
  FaUserFriends, 
  FaUsers, 
  FaPhoneSlash, 
  FaArrowUp, 
  FaArrowDown, 
  FaVideo, 
  FaPhone 
} from "react-icons/fa";
import { Contact } from "../../../../../Interface/User/Icontact";
import { ICallLog } from "../../../../../types";

/* ------------------------------------------------------
   NORMALIZE MESSAGE — ensures all messages have a single
   timestamp field (createdAt), falling back to timestamp
------------------------------------------------------ */
export const normalizeMessage = (msg: IChatMessage): IChatMessage => ({
  ...msg,
  createdAt: msg.createdAt ?? msg.timestamp,
});

/* ------------------------------------------------------
   Generates short preview text for each chat contact.
   Adds a "You:" prefix for personal chats when the user 
   sent the last message.
------------------------------------------------------ */
export const getMessagePreview = (
  lastMessage: IChatMessage | null,
  contactType: string,
  currentUserId: string
): string => {
  if (!lastMessage) return "No messages yet";

  const msg = normalizeMessage(lastMessage);
  let preview = msg.content || "";

  // Automatic labels for media messages
  if (msg.contentType === "image") preview = "Sent a photo";
  else if (msg.contentType === "video") preview = "Sent a video";
  else if (msg.contentType === "file") preview = "Sent a file";

  // Prefix "You:" only for direct chats
  const prefix =
    msg.senderId === currentUserId && contactType !== "group"
      ? "You: "
      : "";

  // Trim long messages
  const truncated = preview.length > 40 ? preview.substring(0, 40) + "..." : preview;

  return prefix + truncated;
};

/* ------------------------------------------------------
   Formats timestamp into either:
   - "h:mm a" (if today)
   - "MMM d"  (if older)
------------------------------------------------------ */
export const formatMessageTime = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday ? format(date, "h:mm a") : format(date, "MMM d");
};

/* ------------------------------------------------------
   Format call timestamps.  
   Shows "h:mm a" if today,
   Otherwise: "MMM d, h:mm a"
------------------------------------------------------ */
export const formatCallTime = (dateStr: string | Date): string => {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  return isToday ? format(date, "h:mm a") : format(date, "MMM d, h:mm a");
};

/* ------------------------------------------------------
   Determines whether the call was outgoing or incoming
   relative to the current user.
------------------------------------------------------ */
export const getCallDirection = (
  callLog: ICallLog,
  currentUserId: string
): "incoming" | "outgoing" => {
  const senderId =
    typeof callLog.senderId === "string"
      ? callLog.senderId
      : callLog.senderId._id;

  return senderId === currentUserId ? "outgoing" : "incoming";
};

/* ------------------------------------------------------
   Returns icon for call status:
   - Missed (red phone slash)
   - Outgoing (blue arrow ↑)
   - Incoming (green arrow ↓)
------------------------------------------------------ */
export const getCallStatusIcon = (callLog: ICallLog, currentUserId: string) => {
  const direction = getCallDirection(callLog, currentUserId);

  if (callLog.status === "missed") {
    return <FaPhoneSlash className="text-red-500" size={12} />;
  }

  return direction === "outgoing" ? (
    <FaArrowUp className="text-blue-500" size={12} />
  ) : (
    <FaArrowDown className="text-green-500" size={12} />
  );
};

/* ------------------------------------------------------
   Returns smart preview text for sidebar:
   Includes a directional arrow:
   ↑ You sent      ↓ You received
   Includes media labels and trims long text.
   Returns JSX element, not plain text.
------------------------------------------------------ */
export const getPreviewText = (summary, currentUserId?: string) => {
  if (!summary) return <>No messages yet</>;

  let label: string;

  // Decide label based on message type
  switch (summary.contentType) {
    case "image":
      label = "[Image]";
      break;
    case "video":
      label = "[Video]";
      break;
    case "file":
      label = "[File]";
      break;
    default:
      label = summary.content || "";
  }

  // Trim long texts
  if (label.length > 35) {
    label = label.slice(0, 35) + "…";
  }

  const isSelf = summary.senderId === currentUserId;

  // Arrow icon: ↑ for sent, ↓ for received
  const arrow = isSelf ? (
    <FaArrowUp size={10} className="text-blue-500 inline-block mr-1" />
  ) : (
    <FaArrowDown size={10} className="text-green-500 inline-block mr-1" />
  );

  return (
    <span className="flex items-center gap-1">
      {arrow}
      <span className="truncate">{label}</span>
    </span>
  );
};

/* ------------------------------------------------------
   Returns Call Type Icon (Audio/Video)
------------------------------------------------------ */
export const getCallTypeIcon = (callType: "video" | "audio") =>
  callType === "video" ? (
    <FaVideo className="text-purple-500" size={12} />
  ) : (
    <FaPhone className="text-gray-500" size={12} />
  );

/* ------------------------------------------------------
   Converts start/end timestamps into call duration.
------------------------------------------------------ */
export const formatCallDuration = (callLog: ICallLog): string => {
  if (callLog.duration) {
    const minutes = Math.floor(callLog.duration / 60);
    const seconds = callLog.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  if (callLog.startTime && callLog.endTime) {
    const start = new Date(callLog.startTime);
    const end = new Date(callLog.endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    return `${Math.floor(duration / 60)}:${(duration % 60)
      .toString()
      .padStart(2, "0")}`;
  }

  return "0:00";
};

/* ------------------------------------------------------
   Determines display name for call log participants.
   Handles:
   - Group calls
   - Direct calls
   - Incoming / Outgoing
------------------------------------------------------ */
export const getCallParticipantName = (
  callLog: ICallLog,
  currentUserId: string
): string => {
  const isSender =
    typeof callLog.senderId === "string"
      ? callLog.senderId === currentUserId
      : callLog.senderId._id === currentUserId;

  if (callLog.type === "group") {
    return `Group Call (${callLog.recipientIds.length + 1} participants)`;
  }

  if (isSender) {
    const r = callLog.recipientIds[0];
    return typeof r === "string" ? callLog.callerName || "Unknown" : r.name;
  }

  return typeof callLog.senderId === "string"
    ? callLog.callerName || "Unknown"
    : callLog.senderId.name || "Unknown";
};

/* ------------------------------------------------------
   Returns "Incoming/Outgoing/Missed" text for call logs.
------------------------------------------------------ */
export const getCallStatusText = (
  callLog: ICallLog,
  currentUserId: string
): string => {
  const direction = getCallDirection(callLog, currentUserId);

  if (callLog.status === "missed") {
    return direction === "incoming"
      ? "Missed Incoming Call"
      : "Missed Outgoing Call";
  }

  return direction === "incoming" ? "Incoming Call" : "Outgoing Call";
};

/* ------------------------------------------------------
   Returns background color for a contact in the sidebar.
   Highlights the selected contact.
------------------------------------------------------ */
export const getContactBgColor = (
  contact: Contact,
  selected?: Contact | null
): string => {
  const isSelected = selected?.id === contact.id;

  if (isSelected) {
    switch (contact.type) {
      case "user-mentor":
        return "bg-blue-100 dark:bg-blue-900/40";
      case "user-user":
        return "bg-purple-100 dark:bg-purple-900/40";
      case "group":
        return "bg-emerald-100 dark:bg-emerald-900/40";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  }

  return "hover:bg-gray-100 dark:hover:bg-gray-800";
};

/* ------------------------------------------------------
   Returns icon for each contact type
------------------------------------------------------ */
export const getContactIcon = (type: string) => {
  switch (type) {
    case "user-mentor":
      return <FaGraduationCap className="text-blue-500" />;
    case "user-user":
      return <FaUserFriends className="text-purple-500" />;
    case "group":
      return <FaUsers className="text-emerald-500" />;
    default:
      return null;
  }
};
