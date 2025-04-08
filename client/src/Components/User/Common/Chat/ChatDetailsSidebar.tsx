import React from "react";
import { Card, CardBody, Avatar, Divider, Chip } from "@nextui-org/react";
import { Contact } from "../../../../types";

interface ChatDetailsSidebarProps {
  selectedContact: Contact | null;
  currentUserId?: string;
}

// ChatDetailsSidebar component: Displays user/group details based on selected chat
const ChatDetailsSidebar: React.FC<ChatDetailsSidebarProps> = ({ selectedContact, currentUserId }) => {
  // Show fallback UI if no contact is selected
  if (!selectedContact) {
    return (
      <Card className="w-1/4 ml-4 shadow-xl rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <CardBody className="p-6 flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Select a contact to view details
          </p>
        </CardBody>
      </Card>
    );
  }

  // Render for user-mentor type conversations
  const renderUserMentorDetails = () => {
    const isUser = selectedContact.userId === currentUserId;
    const otherParty = isUser ? "Mentor" : "User";

    // Extract details from the selected contact
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
      sessions: selectedContact.collaborationDetails?.selectedSlot.length || "N/A",
      price: selectedContact.collaborationDetails?.price || "N/A",
    };

    return (
      <div className="text-center">
        {/* Avatar and name */}
        <Avatar
          src={targetDetails.profilePic}
          size="lg"
          className="mx-auto mb-4 border-4 border-blue-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{targetDetails.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {otherParty} - {targetDetails.jobTitle}
        </p>

        <Divider className="my-4 bg-blue-200 dark:bg-gray-700" />

        {/* Collaboration details */}
        <div className="space-y-4 text-left">
          <Chip color="primary" variant="flat" className="w-full text-center">
            <strong>Type:</strong> User-Mentor
          </Chip>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Start Date:</strong> {targetDetails.startDate}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>End Date:</strong> {targetDetails.endDate}
          </p>
        </div>
      </div>
    );
  };

  // Render for user-user connections
  const renderUserUserDetails = () => {
    const connectedSince = selectedContact.connectionDetails?.requestAcceptedAt
      ? new Date(selectedContact.connectionDetails.requestAcceptedAt).toLocaleDateString()
      : "N/A";

    return (
      <div className="text-center">
        {/* Avatar and name */}
        <Avatar
          src={selectedContact.profilePic}
          size="lg"
          className="mx-auto mb-4 border-4 border-purple-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{selectedContact.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {selectedContact.targetJobTitle || "N/A"}
        </p>

        <Divider className="my-4 bg-purple-200 dark:bg-gray-700" />

        {/* Connection info */}
        <div className="space-y-4 text-left">
          <Chip color="secondary" variant="flat" className="w-full text-center">
            <strong>Type:</strong> User-User
          </Chip>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Connected Since:</strong> {connectedSince}
          </p>
        </div>
      </div>
    );
  };

  // Render for group chats
  const renderGroupDetails = () => {
    const startDate = selectedContact.groupDetails?.startDate
      ? new Date(selectedContact.groupDetails.startDate).toLocaleDateString()
      : "N/A";
    const adminName = selectedContact.groupDetails?.adminName || "N/A";
    const memberCount = selectedContact.groupDetails?.members.length || "N/A";

    return (
      <div className="text-center">
        {/* Group avatar and name */}
        <Avatar
          src={selectedContact.profilePic}
          size="lg"
          className="mx-auto mb-4 border-4 border-green-500 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{selectedContact.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Group</p>

        <Divider className="my-4 bg-green-200 dark:bg-gray-700" />

        {/* Group details */}
        <div className="space-y-4 text-left">
          <Chip color="success" variant="flat" className="w-full text-center">
            <strong>Type:</strong> Group
          </Chip>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Admin:</strong> {adminName}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Members:</strong> {memberCount}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Start Date:</strong> {startDate}
          </p>
        </div>
      </div>
    );
  };

  // Main return block with conditional rendering based on type
  return (
    <Card className="w-1/4 ml-4 shadow-xl rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <CardBody className="p-6 flex flex-col items-center">
        {selectedContact.type === "user-mentor" && renderUserMentorDetails()}
        {selectedContact.type === "user-user" && renderUserUserDetails()}
        {selectedContact.type === "group" && renderGroupDetails()}
      </CardBody>
    </Card>
  );
};

export default ChatDetailsSidebar;
