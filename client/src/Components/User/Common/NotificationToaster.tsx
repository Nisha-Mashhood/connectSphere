import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { Contact, Notification } from "../../../types";
import { useNavigate } from "react-router-dom";
import { markNotificationAsRead } from "../../../redux/Slice/notificationSlice";
import { markNotificationAsRead as markNotificationService } from "../../../Service/NotificationService";

const NotificationToaster: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, selectedContact } = useSelector((state: RootState) => state.user); // Added selectedContact
  const { notifications } = useSelector((state: RootState) => state.notification);
  const renderedNotifications = useRef<Set<string>>(new Set());

  const getChatKey = (contact: Contact | null): string => {
    if (!contact || !contact.type) {
      return "";
    }
    return contact.type === "group"
      ? `group_${contact.groupId}`
      : contact.type === "user-mentor"
      ? `user-mentor_${contact.collaborationId}`
      : `user-user_${contact.userConnectionId}`;
  };
  useEffect(() => {
    if (!currentUser) return;

    const newNotifications = notifications.filter(
      (n) =>
        !renderedNotifications.current.has(n._id) &&
        n.status === "unread" &&
        n.relatedId !== getChatKey(selectedContact) // Skip if in active chat
    );

    newNotifications.forEach((notification) => {
      renderedNotifications.current.add(notification._id);
      toast(
        (t) => (
          <span
            onClick={() => {
              handleNotificationClick(notification);
              toast.dismiss(t.id);
            }}
            className="cursor-pointer"
          >
            {notification.content}
          </span>
        ),
        {
          duration: notification.type === "incoming_call" ? 30000 : 5000,
          position: "top-right",
          style: {
            background: notification.type === "incoming_call" ? "#ffedd5" : "#f0fdf4",
            color: "#1f2937",
            border: `1px solid ${notification.type === "incoming_call" ? "#f97316" : "#22c55e"}`,
          },
        }
      );
    });

    renderedNotifications.current = new Set(
      notifications.map((n) => n._id).filter((id) => renderedNotifications.current.has(id))
    );
  }, [notifications, currentUser, selectedContact]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const [type] = notification.relatedId.split("_");
      const id = notification.senderId;
      const contactType = type === "group" ? "group" : type === "user-mentor" ? "user-mentor" : "user-user";
      await markNotificationService(notification._id, currentUser?._id || "");
      dispatch(markNotificationAsRead(notification._id));
      navigate(`/chat/${contactType}/${id}`);
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast.error("Failed to open chat.");
    }
  };

  return null;
};

export default NotificationToaster;