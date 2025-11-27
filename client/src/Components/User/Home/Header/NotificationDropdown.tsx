import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Badge,
  Divider,
} from "@nextui-org/react";
import { FaBell, FaCheck } from "react-icons/fa";
import { formatDate } from "../../../../pages/User/Profile/helper";
import BaseModal from "../../../ReusableComponents/BaseModal";
import { Notification } from "../../../../Interface/User/Inotification";

interface Props {
  unreadNotifications: Notification[];
  taskUnreadCount: number;
  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;

  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (v: boolean) => void;

  handleNotificationClick: (n) => void;
  markSingleNotificationAsRead: (id: string, uid: string) => void;
  markAllNotifications: () => Promise<void>;
  currentUserId: string;
}

const NotificationDropdown = ({
  unreadNotifications,
  taskUnreadCount,
  dropdownOpen,
  setDropdownOpen,
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  handleNotificationClick,
  markSingleNotificationAsRead,
  markAllNotifications,
  currentUserId,
}: Props) => {
  return (
    <>
      <Dropdown
        placement="bottom-end"
        isOpen={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownTrigger>
          <Button isIconOnly variant="light" className="relative">
            <Badge
              content={taskUnreadCount}
              color="danger"
              isInvisible={taskUnreadCount === 0}
              size="sm"
              placement="top-right"
            >
              <FaBell size={24} className="text-gray-700 hover:text-blue-600" />
            </Badge>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Notifications"
          variant="flat"
          className="w-96 max-h-96 overflow-y-auto"
        >
          {unreadNotifications.length > 0 ? (
            <>
              <DropdownItem isReadOnly className="cursor-default" key="header">
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold">Notifications</span>

                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => {
                      setDropdownOpen(false);
                      setIsConfirmModalOpen(true);
                    }}
                  >
                    Mark all read
                  </Button>
                </div>
                <Divider />
              </DropdownItem>

              {unreadNotifications.map((notification, index) => (
                <DropdownItem
                  key={`${notification.id}-${index}`}
                  textValue={notification.content}
                  isReadOnly
                  className="opacity-100 hover:bg-gray-50"
                >
                  <div
                    className="flex gap-3 items-start py-2 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaBell className="text-blue-600" size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug mb-1">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markSingleNotificationAsRead(
                          notification.id,
                          currentUserId
                        );
                      }}
                      className="w-8 h-8 rounded-full hover:bg-green-100 flex items-center justify-center transition-colors"
                      aria-label="Mark as read"
                    >
                      <FaCheck size={16} className="text-green-600" />
                    </button>
                  </div>
                </DropdownItem>
              ))}
            </>
          ) : (
            <DropdownItem isReadOnly key="empty">
              <div className="py-8 text-center text-gray-400">
                <FaBell size={40} className="mb-3" />
                No new notifications
              </div>
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>

      <BaseModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Mark all notifications as read?"
        actionText="Yes, Mark all"
        cancelText="Cancel"
        onSubmit={async () => {
          await markAllNotifications();
          setIsConfirmModalOpen(false);
        }}
      >
        <p>Are you sure you want to mark all notifications as read?</p>
      </BaseModal>
    </>
  );
};

export default NotificationDropdown;
