import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../../Interface/User/Inotification";

interface NotificationState {
  chatNotifications: Notification[];
  taskNotifications: Notification[];
  chatUnreadCount: number;
  taskUnreadCount: number;
  isInChatComponent: boolean;
  activeChatKey: string | null;
}

const initialState: NotificationState = {
  chatNotifications: [],
  taskNotifications: [],
  chatUnreadCount: 0,
  taskUnreadCount: 0,
  isInChatComponent: false,
  activeChatKey: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Set All Notifications (from backend fetch)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      // Split chat vs task notifications
      state.chatNotifications = action.payload.filter((n) =>
        ["message", "incoming_call", "client_call", "missed_call"].includes(
          n.type
        )
      );

      state.taskNotifications = action.payload.filter((n) =>
        ["task_reminder", "mentor_approved", "collaboration_status"].includes(
          n.type
        )
      );

      //unread update
      state.chatUnreadCount = state.chatNotifications.filter(
        (n) => n.status === "unread"
      ).length;

      state.taskUnreadCount = state.taskNotifications.filter(
        (n) => n.status === "unread"
      ).length;
    },

    // ADD New Notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      const n = action.payload;

      // CHAT NOTIFICATIONS
      if (
        ["message", "incoming_call", "client_call", "missed_call"].includes(
          n.type
        )
      ) {
        // If user is actively in chat panel AND inside same chat → auto-read
        const isActiveChat =
          state.isInChatComponent && state.activeChatKey === n.relatedId;

        const finalNotification : Notification = isActiveChat
          ? { ...n, status: "read" }
          : n;

        state.chatNotifications = [
          finalNotification,
          ...state.chatNotifications,
        ];
      }

      // TASK / COLLAB NOTIFICATIONS
      else {
        state.taskNotifications = [
          action.payload,
          ...state.taskNotifications,
        ];
      }

      // Central unread update
      state.chatUnreadCount = state.chatNotifications.filter(
        (n) => n.status === "unread"
      ).length;

      state.taskUnreadCount = state.taskNotifications.filter(
        (n) => n.status === "unread"
      ).length;
    },

    // Update Notification (task/missed call update)
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const updated = action.payload;

      if (
        ["message", "incoming_call", "client_call", "missed_call"].includes(
          updated.type
        )
      ) {
        state.chatNotifications = state.chatNotifications.map((n) =>
          n.id === updated.id ? updated : n
        );
      } else {
        state.taskNotifications = state.taskNotifications.map((n) =>
          n.id === updated.id ? updated : n
        );
      }

      // Central unread update
      state.chatUnreadCount = state.chatNotifications.filter(
        (n) => n.status === "unread"
      ).length;

      state.taskUnreadCount = state.taskNotifications.filter(
        (n) => n.status === "unread"
      ).length;
    },

    // Mark a single notification as read
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      state.chatNotifications = state.chatNotifications.map((n) =>
        n.id === id ? { ...n, status: "read" } : n
      );

      state.taskNotifications = state.taskNotifications.map((n) =>
        n.id === id ? { ...n, status: "read" } : n
      );

      // Central unread update
      state.chatUnreadCount = state.chatNotifications.filter(
        (n) => n.status === "unread"
      ).length;

      state.taskUnreadCount = state.taskNotifications.filter(
        (n) => n.status === "unread"
      ).length;
    },

    // Clear All Notifications
    clearNotifications: (state) => {
      state.chatNotifications = [];
      state.taskNotifications = [];
      state.chatUnreadCount = 0;
      state.taskUnreadCount = 0;
    },

    // User Entered or Left Chat Component
    setIsInChatComponent: (state, action: PayloadAction<boolean>) => {
      state.isInChatComponent = action.payload;

      // If user enters chat → mark notifications of active chat as read
      if (action.payload && state.activeChatKey) {
        state.chatNotifications = state.chatNotifications.map((n) =>
          ["message", "incoming_call"].includes(n.type) &&
          n.relatedId === state.activeChatKey &&
          n.status === "unread"
            ? { ...n, status: "read" }
            : n
        );

        // Central unread update
        state.chatUnreadCount = state.chatNotifications.filter(
          (n) => n.status === "unread"
        ).length;
      }
    },

    // Update Active Chat Key
    setActiveChatKey: (state, action: PayloadAction<string | null>) => {
      state.activeChatKey = action.payload;
    },

    //Allow external unread updates
    setUnreadCounts: (
      state,
      action: PayloadAction<{ chatUnreadCount: number; taskUnreadCount: number }>
    ) => {
      state.chatUnreadCount = action.payload.chatUnreadCount;
      state.taskUnreadCount = action.payload.taskUnreadCount;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  markNotificationAsRead,
  clearNotifications,
  setIsInChatComponent,
  setActiveChatKey,
  setUnreadCounts,
} = notificationSlice.actions;

export default notificationSlice.reducer;
