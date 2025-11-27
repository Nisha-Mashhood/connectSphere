import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { RootState } from "../../../redux/store";
import { socketService } from "../../../Service/SocketService";
import { setNotifications, addNotification, updateNotification, markNotificationAsRead } from "../../../redux/Slice/notificationSlice";
import { fetchNotificationService } from "../../../Service/Notification.Service";
import { Notification } from "../../../Interface/User/Inotification";

const NotificationHandler: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { isInChatComponent } = useSelector(
    (state: RootState) => state.notification
  );

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const token = localStorage.getItem("authToken") || "";
    if (!socketService.isConnected()) {
      socketService.connect(currentUser.id, token);
    }

    const fetchNotifications = async () => {
      try {
        const notifications = await fetchNotificationService(currentUser.id);
        dispatch(setNotifications(notifications));
      } catch (error) {
        console.error("[NotificationHandler] Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const handleNotificationNew = (notification: Notification) => {
      dispatch(addNotification(notification));
      if ( notification.type === "task_reminder" &&  notification.status === "unread" && !isInChatComponent ) {
        toast.success(notification.content, { id: notification.id, duration: 5000, });
      }
    };

    const handleNotificationRead = ({ notificationId }: { notificationId: string }) => {
      dispatch(markNotificationAsRead(notificationId));
    };

    const handleNotificationUpdated = (notification: Notification) => {
      dispatch(updateNotification(notification));
    };

    socketService.onNotificationNew(handleNotificationNew);
    socketService.onNotificationRead(handleNotificationRead);
    socketService.onNotificationUpdated(handleNotificationUpdated);

    return () => {
      console.log("[NotificationHandler] Cleaning up NotificationHandler listeners");
      socketService.socket?.off("notification.new", handleNotificationNew);
      socketService.socket?.off("notification.read", handleNotificationRead);
      socketService.socket?.off("notification.updated", handleNotificationUpdated);
    };
  }, [currentUser?.id, dispatch, isInChatComponent]);

  return null;
};

export default NotificationHandler;