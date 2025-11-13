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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactReplySchema } from "../../validation/contactMessageReplyValidation";

interface ReplyFormValues {
  email: string;
  replyMessage: string;
}

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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReplyFormValues>({
    resolver: yupResolver(contactReplySchema),
    defaultValues: { email: "", replyMessage: "" },
  });

  const openReplyModal = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setValue("email", msg.email);
    setValue("replyMessage", "");
    setIsReplyModalOpen(true);
  };

  const submitReply = async (data: ReplyFormValues) => {
    if (!selectedMessage) return;

    await sendMessageReply(selectedMessage, data.replyMessage);

    reset();
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

  // Table columns
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
          {/* Search & Filter */}
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

      {/* Reply Modal */}
      <BaseModal
        isOpen={isReplyModalOpen}
        onClose={() => {
          reset();
          setIsReplyModalOpen(false);
        }}
        title={`Reply to ${selectedMessage?.name}`}
        onSubmit={handleSubmit(submitReply)}
        actionText="Send Reply"
      >
        <Input
          label="Email"
          isReadOnly
          {...register("email")}
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
        />

        <Textarea
          label="Reply Message"
          minRows={4}
          {...register("replyMessage")}
          isInvalid={!!errors.replyMessage}
          errorMessage={errors.replyMessage?.message}
        />
      </BaseModal>
    </div>
  );
};

export default Messages;
