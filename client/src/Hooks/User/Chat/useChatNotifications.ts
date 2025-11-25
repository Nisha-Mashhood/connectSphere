import { useCallback, useEffect } from "react";
import { socketService } from "../../../Service/SocketService";
import { fetchNotificationService, markNotificationAsRead as markNotificationService } from "../../../Service/Notification.Service";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  // updateNotification,
  markNotificationAsRead,
  setNotifications,
  // setIsInChatComponent,
  // setActiveChatKey,
} from "../../../redux/Slice/notificationSlice";
import { RootState } from "../../../redux/store";
import { Notification } from "../../../Interface/User/Inotification";

export const useChatNotifications = (currentUserId?: string) => {
  const dispatch = useDispatch();

  const {
    chatNotifications,
    taskNotifications,
    chatUnreadCount,
    taskUnreadCount,
    activeChatKey,
    isInChatComponent,
  } = useSelector((state: RootState) => state.notification);

  // -------------------------------------------------------------
  // Load all notifications on mount
  // -------------------------------------------------------------
  const loadNotifications = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const result = await fetchNotificationService(currentUserId);
      dispatch(setNotifications(result));
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }, [currentUserId, dispatch]);

  // -------------------------------------------------------------
  // Helper — Mark a single notification as read (backend + redux + socket)
  // -------------------------------------------------------------
  const markSingleNotificationAsRead = useCallback(
    async (notificationId: string, userId: string) => {
      try {
        await markNotificationService(notificationId, userId);
        dispatch(markNotificationAsRead(notificationId));
        socketService.markNotificationAsRead(notificationId, userId);
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [dispatch]
  );

  // -------------------------------------------------------------
  // Auto mark message notifications as read when:
  // - user is inside Chat
  // - AND activeChatKey matches the message’s chatKey
  // -------------------------------------------------------------
  const autoMarkMessageNotificationAsRead = useCallback(
    async (chatKey: string) => {
      if (!isInChatComponent || !currentUserId) return;

      const unreadForThisChat = chatNotifications.filter(
        (n) =>
          n.relatedId === chatKey &&
          ["message", "incoming_call", "missed_call"].includes(n.type) &&
          n.status === "unread"
      );

      for (const n of unreadForThisChat) {
        await markSingleNotificationAsRead(n.id, currentUserId);
      }
    },
    [
      isInChatComponent,
      currentUserId,
      chatNotifications,
      markSingleNotificationAsRead,
    ]
  );

  // -------------------------------------------------------------
  // SOCKET — Listen for new notifications from backend
  // -------------------------------------------------------------
  useEffect(() => {
    const handleNewNotification = (payload: Notification) => {
      console.log("🔔 Incoming Notification:", payload);
      dispatch(addNotification(payload));
    };

    socketService.onNotificationNew(handleNewNotification);

    return () => {
      socketService.offNotificationNew(handleNewNotification);
    };
  }, [dispatch]);

  return {
    chatNotifications,
    taskNotifications,
    chatUnreadCount,
    taskUnreadCount,
    activeChatKey,
    isInChatComponent,
    loadNotifications,

    // exposed helper functions
    autoMarkMessageNotificationAsRead,
    markSingleNotificationAsRead,
  };
};
