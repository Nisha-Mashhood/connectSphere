import { useState, useEffect } from "react";
import { Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Card, CardBody } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { getContactMessages, sendReply } from "../../Service/ContactUs.Service";

interface ContactMessage {
  contactMessageId: string;
  name: string;
  email: string;
  message: string;
  givenReply: boolean;
  createdAt: string;
}

const Messages = () => {
  const [pendingMessages, setPendingMessages] = useState<ContactMessage[]>([]);
  const [repliedMessages, setRepliedMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messages = await getContactMessages();
      setPendingMessages(messages.filter((msg: ContactMessage) => !msg.givenReply));
      setRepliedMessages(messages.filter((msg: ContactMessage) => msg.givenReply));
    } catch (error: any) {
      toast.error("Failed to fetch messages: " + error.message);
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      toast.error("Reply message is required");
      return;
    }

    try {
      const reply = await sendReply(selectedMessage.contactMessageId, { email: selectedMessage.email, replyMessage });
      console.log(reply);
      if(reply){
          toast.success("Reply sent successfully!");
          setIsReplyModalOpen(false);
          setReplyMessage("");
          setSelectedMessage(null);
          fetchMessages();
      }
 
    } catch (error: any) {
      toast.error("Failed to send reply: " + error.message);
      console.error("Error sending reply:", error);
    }
  };

  // Format date 
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <Card>
        <CardBody>
          <Tabs aria-label="Message Tabs">
            <Tab key="pending" title="Pending Replies">
              {loading ? (
                <p>Loading...</p>
              ) : pendingMessages.length === 0 ? (
                <p>No pending messages.</p>
              ) : (
                <Table aria-label="Pending Messages Table">
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Message</TableColumn>
                    <TableColumn>Received At</TableColumn>
                    <TableColumn>Action</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pendingMessages.map((message) => (
                      <TableRow key={message.contactMessageId}>
                        <TableCell>{message.contactMessageId}</TableCell>
                        <TableCell>{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell>{message.message}</TableCell>
                        <TableCell>{formatDate(message.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            color="primary"
                            size="sm"
                            onPress={() => {
                              setSelectedMessage(message);
                              setIsReplyModalOpen(true);
                            }}
                          >
                            Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Tab>
            <Tab key="replied" title="Replied">
              {loading ? (
                <p>Loading...</p>
              ) : repliedMessages.length === 0 ? (
                <p>No replied messages.</p>
              ) : (
                <Table aria-label="Replied Messages Table">
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Message</TableColumn>
                    <TableColumn>Received At</TableColumn>
                    <TableColumn>Action</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {repliedMessages.map((message) => (
                      <TableRow key={message.contactMessageId}>
                        <TableCell>{message.contactMessageId}</TableCell>
                        <TableCell>{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell>{message.message}</TableCell>
                        <TableCell>{formatDate(message.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            color="primary"
                            size="sm"
                            onPress={() => {
                              setSelectedMessage(message);
                              setIsReplyModalOpen(true);
                            }}
                          >
                            Reply Again
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Reply Modal */}
      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} size="md">
        <ModalContent>
          <ModalHeader>Reply to {selectedMessage?.name}</ModalHeader>
          <ModalBody>
            <Input
              label="Email"
              value={selectedMessage?.email || ""}
              isReadOnly
            />
            <Textarea
              label="Reply Message"
              placeholder="Enter your reply"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              minRows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsReplyModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSendReply}>
              Send Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Messages;