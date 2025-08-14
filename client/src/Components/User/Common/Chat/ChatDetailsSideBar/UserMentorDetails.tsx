import React from "react";
import { Avatar, Divider, Progress } from "@nextui-org/react";
import { Contact } from "../../../../../types";
import { CalendarIcon, CreditCardIcon } from "lucide-react";
import { ColorScheme } from "./useColorScheme";

interface UserMentorDetailsProps {
  selectedContact: Contact;
  currentUserId?: string;
  colors: ColorScheme;
}

const UserMentorDetails: React.FC<UserMentorDetailsProps> = ({ selectedContact, currentUserId, colors }) => {
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
                ₹{targetDetails.price}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMentorDetails;