import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { RootState } from "../../../redux/store";
import { socketService } from "../../../Service/SocketService";
import { Notification } from "../../../types";
import { setNotifications, addNotification, updateNotification, markNotificationAsRead } from "../../../redux/Slice/notificationSlice";
import { fetchNotificationService } from "../../../Service/Notification.Service";

const NotificationHandler: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!currentUser?._id) {
      socketService.disconnect();
      console.log("[NotificationHandler] No user, disconnected socket");
      return;
    }

    console.log(`[NotificationHandler] Connecting socket for user: ${currentUser._id}`);
    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);

    const fetchNotifications = async () => {
      try {
        const notifications = await fetchNotificationService(currentUser._id);
        console.log("[NotificationHandler] Fetched notifications:", notifications);

        dispatch(setNotifications([]));

        notifications.forEach((notification: Notification) => {
          dispatch(addNotification(notification));
          if (notification.status === "unread" && notification.type === "task_reminder") {
            toast.success(notification.content, {
              duration: 5000,
              id: notification._id, 
            });
          }
        });
      } catch (error) {
        console.error("[NotificationHandler] Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const handleNotificationNew = (notification: Notification) => {
      console.log("[NotificationHandler] Received new notification:", notification);
      dispatch(addNotification(notification));
      // if (notification.type === "task_reminder") {
      //   toast.success(notification.content, {
      //     duration: 5000,
      //     id: notification._id,
      //   });
      // }
    };

    const handleNotificationRead = ({ notificationId }: { notificationId: string }) => {
      console.log("[NotificationHandler] Notification read:", notificationId);
      dispatch(markNotificationAsRead(notificationId));
    };

    const handleNotificationUpdated = (notification: Notification) => {
      console.log("[NotificationHandler] Notification updated:", notification);
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
      socketService.disconnect();
    };
  }, [currentUser?._id, dispatch]);

  return null;
};

export default NotificationHandler;