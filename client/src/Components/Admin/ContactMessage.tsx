import {
  Tabs,
  Tab,
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
  Textarea,
} from "@nextui-org/react";

import SearchBar from "../ReusableComponents/SearchBar";
import DataTable from "../ReusableComponents/DataTable";
import BaseModal from "../ReusableComponents/BaseModal";

import { useContactMessages } from "../../Hooks/Admin/useContactMessages";
import { ContactMessage } from "../../Interface/Admin/IContactMessage";
import { useState, useMemo } from "react";

const Messages = () => {
  const {
    messages,
    loading,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    page,
    setPage,
    limit,
    total,
    sendMessageReply,
  } = useContactMessages();

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const openReplyModal = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplyMessage("");
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    await sendMessageReply(selectedMessage, replyMessage);
    setIsReplyModalOpen(false);
  };

  const pendingMessages = useMemo(
    () => messages.filter((m) => !m.givenReply),
    [messages]
  );

  const repliedMessages = useMemo(
    () => messages.filter((m) => m.givenReply),
    [messages]
  );

  const formatDate = (d: string) => new Date(d).toLocaleString();

  // DataTable Columns
  const columns = [
    { key: "contactMessageId", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "message", label: "Message" },
    {
      key: "createdAt",
      label: "Received At",
      render: (item: ContactMessage) => formatDate(item.createdAt),
    },
    {
      key: "action",
      label: "Action",
      render: (item: ContactMessage) => (
        <Button
          size="sm"
          color={item.givenReply ? "secondary" : "primary"}
          onPress={() => openReplyModal(item)}
        >
          {item.givenReply ? "Reply Again" : "Reply"}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between gap-4 mb-6">
            <SearchBar
              activeTab="Messages"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchChange={(v) => {
                setPage(1);
                setSearchQuery(v);
              }}
            />

            <Select
              label="Filter by Date"
              className="w-48"
              selectedKeys={[dateFilter]}
              onChange={(e) =>
                setDateFilter(
                  e.target.value as "all" | "today" | "7days" | "30days"
                )
              }
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="today">Today</SelectItem>
              <SelectItem key="7days">Last 7 Days</SelectItem>
              <SelectItem key="30days">Last 30 Days</SelectItem>
            </Select>
          </div>

          <Tabs>
            <Tab key="pending" title="Pending Replies">
              <DataTable<ContactMessage>
                data={pendingMessages}
                columns={columns}
                loading={loading}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                emptyMessage="No pending messages found"
              />
            </Tab>

            <Tab key="replied" title="Replied Messages">
              <DataTable<ContactMessage>
                data={repliedMessages}
                columns={columns}
                loading={loading}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                emptyMessage="No replied messages found"
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      <BaseModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={`Reply to ${selectedMessage?.name}`}
        onSubmit={handleSendReply}
        actionText="Send Reply"
      >
        <Input label="Email" isReadOnly value={selectedMessage?.email || ""} />

        <Textarea
          label="Reply Message"
          placeholder="Enter your reply"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          minRows={4}
        />
      </BaseModal>
    </div>
  );
};

export default Messages;
