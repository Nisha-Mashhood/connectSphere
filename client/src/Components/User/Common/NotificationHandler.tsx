import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";
import { socketService } from "../../../Service/SocketService";
import { Notification } from "../../../types";
import { setNotifications, addNotification, updateNotification, markNotificationAsRead } from "../../../redux/Slice/notificationSlice";
import { fetchNotificationService } from "../../../Service/NotificationService";

const NotificationHandler: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!currentUser?._id) {
      socketService.disconnect();
      return;
    }

    const token = localStorage.getItem("authToken") || "";
    socketService.connect(currentUser._id, token);

    const fetchNotifications = async () => {
      try {
        const notifications = await fetchNotificationService(currentUser._id);
        console.log("Fetched notifications:", notifications);
        dispatch(setNotifications(notifications));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const handleNotificationNew = (notification: Notification) => {
      console.log("Received new notification:", notification);
      dispatch(addNotification(notification));
    };

    const handleNotificationRead = ({ notificationId }: { notificationId: string }) => {
      console.log("Notification read:", notificationId);
      dispatch(markNotificationAsRead(notificationId));
    };

    const handleNotificationUpdated = (notification: Notification) => {
      console.log("Notification updated:", notification);
      dispatch(updateNotification(notification));
    };

    socketService.onNotificationNew(handleNotificationNew);
    socketService.onNotificationRead(handleNotificationRead);
    socketService.onNotificationUpdated(handleNotificationUpdated);

    return () => {
      console.log("Cleaning up NotificationHandler listeners");
      socketService.socket?.off("notification.new", handleNotificationNew);
      socketService.socket?.off("notification.read", handleNotificationRead);
      socketService.socket?.off("notification.updated", handleNotificationUpdated);
      socketService.disconnect();
    };
  }, [currentUser?._id, dispatch]);

  return null;
};

export default NotificationHandler;