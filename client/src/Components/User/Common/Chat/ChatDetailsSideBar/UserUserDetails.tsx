import React from "react";
import { Avatar, Divider } from "@nextui-org/react";
import { Contact } from "../../../../../types";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { ColorScheme } from "./useColorScheme";

interface UserUserDetailsProps {
  selectedContact: Contact;
  colors: ColorScheme;
}

const UserUserDetails: React.FC<UserUserDetailsProps> = ({ selectedContact, colors }) => {
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

export default UserUserDetails;