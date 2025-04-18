import { Contact, Notification } from "../../../../../types";
import { AlertTriangle } from "lucide-react";
import { formatTime } from "./formatUtils";

// Props for the Notifications component
interface NotificationsProps {
  selectedContact: Contact | null;
  notifications: Notification[];
  onNotificationClick: (contact: Contact) => void;
}

// Component to render notification banners
const Notifications: React.FC<NotificationsProps> = ({
  selectedContact,
  notifications,
  onNotificationClick,
}) => {
  if (!selectedContact || notifications.length === 0) return null;

  // Filter notifications for the selected contact
  const contactNotifications = notifications.filter(
    (notif) => notif.contactId === selectedContact.id && notif.type === selectedContact.type
  );

  if (contactNotifications.length === 0) return null;

  return (
    <div className="space-y-2">
      {contactNotifications.map((notification, index) => (
        <div
          key={index}
          className="m-2 p-2 sm:p-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 text-amber-800 dark:text-amber-200 rounded-lg shadow-md border border-amber-200 dark:border-amber-700 cursor-pointer transform transition-transform hover:scale-102 animate-fade-in"
          onClick={() => onNotificationClick(selectedContact)}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <div className="font-medium text-sm sm:text-base">{notification.message}</div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                {formatTime(notification.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;