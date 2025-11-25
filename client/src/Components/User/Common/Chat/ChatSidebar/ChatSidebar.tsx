import { useState } from "react";
import { Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { useChatSidebar } from "../../../../../Hooks/User/Chat/useChatSidebar";
import SidebarHeader from "./SidebarHeader";
import CallLogItem from "./CallLogItem";
import EmptyState from "./EmptyState.tsx";
import ContactItem from "./ContactItem.tsx";
import { FaGraduationCap, FaPhone, FaUserFriends, FaUsers } from "react-icons/fa";

const ChatSidebar = (props) => {
  const {
    contacts,
    selectedContact,
    onContactSelect,
    unreadCounts,
    lastMessages,
    currentUserId,
    callLogs,
    isOverlay,
    onClose,
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { filteredContacts, filteredCallLogs, counts } = useChatSidebar({
    contacts,
    callLogs,
    searchQuery,
    selectedType,
  });

  return (
    <Card className="h-full rounded-none bg-white dark:bg-gray-900">
      <CardBody className="p-0 flex flex-col h-full">
        {/* HEADER */}
        <SidebarHeader
          selectedType={selectedType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isOverlay={isOverlay}
          onClose={onClose}
        />

        {/* TABS */}
        <Tabs
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key as string)}
          variant="underlined"
          className="px-2 pt-2"
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>All</span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                  {counts.all}
                </span>
              </div>
            }
          />

          <Tab
            key="user-user"
            title={
              <div className="flex items-center gap-2">
                <FaUserFriends size={14} className="text-purple-500" />
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                  {counts.userUser}
                </span>
              </div>
            }
          />

          <Tab
            key="user-mentor"
            title={
              <div className="flex items-center gap-2">
                <FaGraduationCap size={14} className="text-blue-500" />
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {counts.userMentor}
                </span>
              </div>
            }
          />

          <Tab
            key="group"
            title={
              <div className="flex items-center gap-2">
                <FaUsers size={14} className="text-emerald-500" />
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                  {counts.groups}
                </span>
              </div>
            }
          />

          <Tab
            key="calls"
            title={
              <div className="flex items-center gap-2">
                <FaPhone size={14} className="text-orange-500" />
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                  {counts.calls}
                </span>
              </div>
            }
          />
        </Tabs>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {selectedType === "calls" ? (
            filteredCallLogs.length > 0 ? (
              filteredCallLogs.map((log) => (
                <CallLogItem
                  key={log._id}
                  callLog={log}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <EmptyState text="No call history found" />
            )
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                unreadCounts={unreadCounts}
                lastMessages={lastMessages}
                selected={selectedContact}
                currentUserId={currentUserId}
                onSelect={() => onContactSelect(contact)}
              />
            ))
          ) : (
            <EmptyState text="No conversations found" />
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChatSidebar;
