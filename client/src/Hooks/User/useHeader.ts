import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { signOut } from "../../redux/Slice/userSlice";
import { markNotificationAsRead } from "../../redux/Slice/notificationSlice";
import { logout, checkProfile } from "../../Service/Auth.service";
import { checkMentorProfile } from "../../Service/Mentor.Service";
import { markNotificationAsRead as markNotificationService } from "../../Service/Notification.Service";
import { socketService } from "../../Service/SocketService";
import { Notification } from "../../Interface/User/Inotification";
import { useChatNotifications } from "./Chat/useChatNotifications";

export const useHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser, loading } = useSelector(
    (state: RootState) => state.user
  );
  const {
    taskNotifications,
    taskUnreadCount,
    chatNotifications,
    chatUnreadCount,
  } = useSelector((state: RootState) => state.notification);

  const { markSingleNotificationAsRead } = useChatNotifications(
    currentUser?.id
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const safeTaskNotifications = Array.isArray(taskNotifications)
    ? taskNotifications
    : [];

  const unreadNotifications = safeTaskNotifications.filter(
    (n) => n.status === "unread"
  );

  const showNotifications =
    currentUser && currentUser.role !== "admin" && !loading;

  // Handle Notification Click
  const handleNotificationClick = async (notification: Notification) => {
    if (!currentUser || currentUser.role === "admin") {
      navigate("/login");
      return;
    }

    try {
      console.log("Clicked on notification:", notification);
      await markNotificationService(notification.id, currentUser.id);
      dispatch(markNotificationAsRead(notification.id));
      socketService.markNotificationAsRead(notification.id, currentUser.id);

      if (
        notification.type === "mentor_approved" ||
        notification.type === "collaboration_status"
      ) {
        navigate("/profile");
        return;
      }

      if (notification.type === "task_reminder") {
        if (!notification.taskContext) {
          toast.error("Task context not found.");
          return;
        }

        const { contextType, contextId } = notification.taskContext;

        if (contextType === "user") {
          navigate(`/profile?taskId=${notification.relatedId}`);
        } else if (contextType === "collaboration") {
          navigate(
            `/collaboration/${contextId}?taskId=${notification.relatedId}`
          );
        } else if (contextType === "group") {
          navigate(`/group/${contextId}?taskId=${notification.relatedId}`);
        } else if (contextType === "userconnection") {
          navigate(`/profile?taskId=${notification.relatedId}`);
        }

        return;
      }

      if (
        ["message", "incoming_call", "client_call", "missed_call"].includes(
          notification.type
        )
      ) {
        const [chatType, chatId] = notification.relatedId.split("_");

        if (chatType === "group") {
          navigate(`/chat/group/${chatId}`);
        } else if (chatType === "user-mentor") {
          navigate(`/chat/user-mentor/${chatId}`);
        } else {
          navigate(`/chat/user-user/${chatId}`);
        }
        return;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      toast.error("Failed to process notification.");
    }
  };

  //Mark all notifications as read
  const markAllNotifications = async () => {
    try {
      const unread = unreadNotifications;

      for (const n of unread) {
        await markSingleNotificationAsRead(n.id, currentUser!.id);
      }

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications:", error);
      toast.error("Failed to mark all as read.");
    }
  };

  //Handle Chat Click
  const handleChatClick = async () => {
    if (!currentUser || currentUser.role === "admin") {
      navigate("/login");
      return;
    }
    try {
      const chatTypes = [
        "message",
        "incoming_call",
        "client_call",
        "missed_call",
      ];
      const unreadChatNotifications = chatNotifications.filter(
        (n) => n.status === "unread" && chatTypes.includes(n.type)
      );

      if (unreadChatNotifications.length > 0) {
        await Promise.all(
          unreadChatNotifications.map(async (n) => {
            await markNotificationService(n.id, currentUser.id);
            dispatch(markNotificationAsRead(n.id));
            socketService.markNotificationAsRead(n.id, currentUser.id);
          })
        );

        toast.success("All chat notifications marked as read");
      }

      navigate("/chat");
    } catch (error) {
      console.error("Error in handleChatClick:", error);
      toast.error("Failed to update notifications");
      navigate("/chat");
    }
  };

  //Handle Profile Click
  const handleProfileClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/profile");
  };

  //Handle Become Mentor
  const handleBecomeMentor = async () => {
    if (!currentUser) {
      toast.error("Please log in to apply as a mentor.");
      navigate("/login");
      return;
    }
    try {
      const profileResponse = await checkProfile(currentUser.id);
      const isProfileComplete = profileResponse.isProfileComplete;

      if (!isProfileComplete) {
        toast.error("Please complete your profile to become a mentor.");
        navigate("/complete-profile", { replace: true });
        return;
      }

      const mentorResponse = await checkMentorProfile(currentUser.id);
      const mentor = mentorResponse.mentor;

      if (!mentor) {
        navigate("/mentorProfile");
      } else {
        switch (mentor.isApproved) {
          case "Processing":
            toast.success("Your mentor request is under review.");
            break;
          case "Completed":
            toast.success("You are an approved mentor!");
            navigate("/profile");
            break;
          case "Rejected":
            toast.error("Your mentor application was rejected.");
            break;
          default:
            toast.error("Unknown status. Please contact support.");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error checking mentor status.");
    }
  };

  // Logout
  const handleLogout = async () => {
    if (!currentUser) return;
    try {
      socketService.disconnect();
      await logout(currentUser.email);
      dispatch(signOut());
      localStorage.removeItem("userId");
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  return {
    currentUser,
    loading,
    taskUnreadCount,
    chatUnreadCount,
    unreadNotifications,
    showNotifications,
    dropdownOpen,
    setDropdownOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handleNotificationClick,
    markAllNotifications,
    markSingleNotificationAsRead,
    handleChatClick,
    handleLogout,
    handleProfileClick,
    handleBecomeMentor,
  };
};
