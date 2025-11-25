import React from "react";
import { Avatar, Divider, Progress } from "@nextui-org/react";
import { Contact } from "../../../../../types";
import { UsersIcon, BadgeCheckIcon, CalendarIcon, DollarSignIcon } from "lucide-react";
import { ColorScheme } from "./useColorScheme";

interface GroupDetailsProps {
  selectedContact: Contact;
  colors: ColorScheme;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ selectedContact, colors }) => {
  const groupDetails = selectedContact.groupDetails;
  if (!groupDetails) {
    return <div className="text-center py-4 text-gray-500 dark:text-gray-400">No group details available</div>;
  }
  console.log(`group details : ${selectedContact.groupDetails.bio}`);

  const startDate = groupDetails.startDate
    ? new Date(groupDetails.startDate).toLocaleDateString()
    : "N/A";
  const adminName = groupDetails.adminName || "N/A";
  const memberCount = groupDetails.members?.length || 0;
  const maxMembers = groupDetails.maxMembers || 4; 
  const memberPercentage = Math.min(Math.round((memberCount / maxMembers) * 100), 100);
  const bio = groupDetails.bio || "No description available";
  const price = groupDetails.price !== undefined ? groupDetails.price : 0;
  const availableSlots = groupDetails.availableSlots || [];

  // Get member initials or name
  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    return words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  };

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
            fallback={<div className="w-full h-full bg-emerald-200 dark:bg-emerald-700 text-gray-800 dark:text-gray-200 font-medium">G</div>}
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
              {startDate}
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 sm:p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2">
            Description
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {bio}
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1 sm:p-2 rounded-full bg-teal-100 dark:bg-teal-900">
            <DollarSignIcon size={14} className="text-teal-600 dark:text-teal-300" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">
              {price > 0 ? `₹${price}` : "Free"}
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 sm:p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2">
            Available Time Slots
          </p>
          {availableSlots.length > 0 ? (
            <ul className="space-y-2">
              {availableSlots.map((slot, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">
                  <span className="font-medium">{slot.day}:</span>{" "}
                  {slot.timeSlots.join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No time slots available</p>
          )}
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 sm:p-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2">
            Active Members
          </p>
          <div className="flex -space-x-2 overflow-hidden">
            {groupDetails.members?.slice(0, 5).map((member, i) => {
              // const user = member.userId || {};
              const name = member.name || "Unknown";
              const profilePic = member.profilePic || "";
              return (
                <Avatar
                  key={i}
                  src={profilePic}
                  size="sm"
                  className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white dark:border-gray-800"
                  aria-label={`Member ${name}`}
                  fallback={
                    <div className="w-full h-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center text-xs font-medium text-white">
                      {getInitials(name)}
                    </div>
                  }
                />
              );
            })}
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

export default GroupDetails;