import React from "react";
import { Card, CardBody, Avatar, Divider, Progress } from "@nextui-org/react";
import { Contact } from "../../../../types";
import { CalendarIcon, UsersIcon, ClockIcon, CreditCardIcon, BadgeCheckIcon } from "lucide-react";

interface ChatDetailsSidebarProps {
  selectedContact: Contact | null;
  currentUserId?: string;
}

const ChatDetailsSidebar: React.FC<ChatDetailsSidebarProps> = ({ selectedContact, currentUserId }) => {
  if (!selectedContact) {
    return (
      <Card className="h-full shadow-xl rounded-xl md:rounded-none bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 border border-indigo-100 dark:border-indigo-900">
        <CardBody className="p-4 sm:p-6 md:p-8 flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 mx-auto flex items-center justify-center">
              <UsersIcon size={20} className="text-indigo-600 dark:text-indigo-300" />
            </div>
            <p className="text-indigo-700 dark:text-indigo-300 text-sm sm:text-base font-medium">
              Select a contact to view details
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getColorScheme = () => {
    switch (selectedContact.type) {
      case "user-mentor":
        return {
          gradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
          border: "border-blue-200 dark:border-blue-800",
          avatarBorder: "border-blue-500",
          divider: "bg-blue-200 dark:bg-blue-800",
          badge: {
            bg: "bg-blue-100 dark:bg-blue-900",
            text: "text-blue-700 dark:text-blue-300",
            icon: <BadgeCheckIcon size={14} className="text-blue-500 mr-1" />,
          },
        };
      case "user-user":
        return {
          gradient: "from-purple-50 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950",
          border: "border-purple-200 dark:border-purple-800",
          avatarBorder: "border-purple-500",
          divider: "bg-purple-200 dark:bg-purple-800",
          badge: {
            bg: "bg-purple-100 dark:bg-purple-900",
            text: "text-purple-700 dark:text-purple-300",
            icon: <UsersIcon size={14} className="text-purple-500 mr-1" />,
          },
        };
      case "group":
        return {
          gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
          border: "border-emerald-200 dark:border-emerald-800",
          avatarBorder: "border-emerald-500",
          divider: "bg-emerald-200 dark:bg-emerald-800",
          badge: {
            bg: "bg-emerald-100 dark:bg-emerald-900",
            text: "text-emerald-700 dark:text-emerald-300",
            icon: <UsersIcon size={14} className="text-emerald-500 mr-1" />,
          },
        };
      default:
        return {
          gradient: "from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900",
          border: "border-gray-200 dark:border-gray-700",
          avatarBorder: "border-gray-500",
          divider: "bg-gray-200 dark:bg-gray-700",
          badge: {
            bg: "bg-gray-100 dark:bg-gray-800",
            text: "text-gray-700 dark:text-gray-300",
            icon: <UsersIcon size={14} className="text-gray-500 mr-1" />,
          },
        };
    }
  };

  const colors = getColorScheme();

  const renderUserMentorDetails = () => {
    const isUser = selectedContact.userId === currentUserId;
    const otherParty = isUser ? "Mentor" : "User";
    const targetDetails = {
      name: selectedContact.name,
      profilePic: selectedContact.profilePic,
      jobTitle: selectedContact.targetJobTitle || "N/A",
      startDate: selectedContact.collaborationDetails?.startDate
        ? new Date(selectedContact.collaborationDetails.startDate).toLocaleDateString()
        : "N/A",
      endDate: selectedContact.collaborationDetails?.endDate
        ? new Date(selectedContact.collaborationDetails.endDate).toLocaleDateString()
        : "Ongoing",
      sessions: selectedContact.collaborationDetails?.selectedSlot.length || 0,
      totalSessions: 12,
      price: selectedContact.collaborationDetails?.price || "N/A",
    };

    const sessionsProgress =
      typeof targetDetails.sessions === "number"
        ? Math.round((targetDetails.sessions / targetDetails.totalSessions) * 100)
        : 0;

    return (
      <div className="text-center w-full">
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-3xl opacity-20"></div>
          <div className="relative pt-6 sm:pt-8 pb-3 sm:pb-4 px-3 sm:px-4">
            <Avatar
              src={targetDetails.profilePic}
              size="lg"
              className={`mx-auto mb-3 sm:mb-4 border-4 ${colors.avatarBorder} shadow-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24`}
              aria-label={`${otherParty} avatar`}
            />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
              {targetDetails.name}
            </h2>
            <div
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full ${colors.badge.bg} ${colors.badge.text} text-xs font-medium mt-1`}
            >
              {colors.badge.icon} {otherParty}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 truncate">
              {targetDetails.jobTitle}
            </p>
          </div>
        </div>

        <Divider className={`my-3 sm:my-4 ${colors.divider}`} />

        <div className="space-y-4 sm:space-y-6 text-left px-3 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <CalendarIcon size={14} className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mentorship Period</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                {targetDetails.startDate} - {targetDetails.endDate}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Sessions Progress
              </span>
              <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                {typeof targetDetails.sessions === "number" ? targetDetails.sessions : 0}/
                {targetDetails.totalSessions}
              </span>
            </div>
            <Progress
              color="primary"
              aria-label="Sessions progress"
              value={sessionsProgress}
              className="h-2"
            />
          </div>

          {targetDetails.price !== "N/A" && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1 sm:p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CreditCardIcon size={14} className="text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mentorship Fee</p>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                  ${targetDetails.price}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUserUserDetails = () => {
    const connectedSince = selectedContact.connectionDetails?.requestAcceptedAt
      ? new Date(selectedContact.connectionDetails.requestAcceptedAt).toLocaleDateString()
      : "N/A";

    const durationDays = selectedContact.connectionDetails?.requestAcceptedAt
      ? Math.floor(
          (new Date().getTime() -
            new Date(selectedContact.connectionDetails.requestAcceptedAt).getTime()) /
            (1000 * 3600 * 24)
        )
      : 0;

    return (
      <div className="text-center w-full">
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-t-3xl opacity-20"></div>
          <div className="relative pt-6 sm:pt-8 pb-3 sm:pb-4 px-3 sm:px-4">
            <Avatar
              src={selectedContact.profilePic}
              size="lg"
              className={`mx-auto mb-3 sm:mb-4 border-4 ${colors.avatarBorder} shadow-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24`}
              aria-label="Connection avatar"
            />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
              {selectedContact.name}
            </h2>
            <div
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full ${colors.badge.bg} ${colors.badge.text} text-xs font-medium mt-1`}
            >
              {colors.badge.icon} Connection
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 truncate">
              {selectedContact.targetJobTitle || "N/A"}
            </p>
          </div>
        </div>

        <Divider className={`my-3 sm:my-4 ${colors.divider}`} />

        <div className="space-y-4 sm:space-y-6 text-left px-3 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <CalendarIcon size={14} className="text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connected Since</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                {connectedSince}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900">
              <ClockIcon size={14} className="text-fuchsia-600 dark:text-fuchsia-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connection Duration</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                {durationDays} days
              </p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 sm:p-4 mt-2">
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">
              Common Interests
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Career Growth", "Technology", "Networking"].map((interest, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupDetails = () => {
    const startDate = selectedContact.groupDetails?.startDate
      ? new Date(selectedContact.groupDetails.startDate).toLocaleDateString()
      : "N/A";
    const adminName = selectedContact.groupDetails?.adminName || "N/A";
    const memberCount = selectedContact.groupDetails?.members.length || 0;
    const maxMembers = 10;

    const memberPercentage = Math.min(Math.round((memberCount / maxMembers) * 100), 100);

    return (
      <div className="text-center w-full">
        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-3xl opacity-20"></div>
          <div className="relative pt-6 sm:pt-8 pb-3 sm:pb-4 px-3 sm:px-4">
            <Avatar
              src={selectedContact.profilePic}
              size="lg"
              className={`mx-auto mb-3 sm:mb-4 border-4 ${colors.avatarBorder} shadow-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24`}
              aria-label="Group avatar"
            />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
              {selectedContact.name}
            </h2>
            <div
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full ${colors.badge.bg} ${colors.badge.text} text-xs font-medium mt-1`}
            >
              {colors.badge.icon} Group
            </div>
          </div>
        </div>

        <Divider className={`my-3 sm:my-4 ${colors.divider}`} />

        <div className="space-y-4 sm:space-y-6 text-left px-3 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <UsersIcon size={14} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {memberCount}/{maxMembers}
                </p>
              </div>
              <Progress
                color="success"
                aria-label="Members capacity"
                value={memberPercentage}
                className="h-2 mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-teal-100 dark:bg-teal-900">
              <BadgeCheckIcon size={14} className="text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm truncate">
                {adminName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2 rounded-full bg-teal-100 dark:bg-teal-900">
              <CalendarIcon size={14} className="text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created On</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
                {startDate}
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 sm:p-4 mt-2">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2">
              Active Members
            </p>
            <div className="flex -space-x-2 overflow-hidden">
              {Array.from({ length: Math.min(memberCount, 5) }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {memberCount > 5 && (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                  +{memberCount - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`h-full shadow-xl rounded-xl md:rounded-none ${colors.gradient} overflow-hidden border ${colors.border}`}
    >
      <CardBody className="p-0 flex flex-col items-center">
        {selectedContact.type === "user-mentor" && renderUserMentorDetails()}
        {selectedContact.type === "user-user" && renderUserUserDetails()}
        {selectedContact.type === "group" && renderGroupDetails()}
      </CardBody>
    </Card>
  );
};

export default ChatDetailsSidebar;